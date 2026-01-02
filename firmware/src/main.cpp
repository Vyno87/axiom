#include "time.h"
#include <Adafruit_Fingerprint.h>
#include <Arduino.h>
#include <ArduinoJson.h>
#include <ArduinoOTA.h>
#include <ESPmDNS.h>
#include <FS.h>
#include <HTTPClient.h>
#include <LittleFS.h>
#include <RTClib.h>
#include <TFT_eSPI.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <WiFiUdp.h>
#include <Wire.h>

// ================== KONFIGURASI ==================
const char *WIFI_SSID = "realme GT Neo2 5G";
const char *WIFI_PASSWORD = "Nyorean9";
const char *API_URL = "https://axiom-pearl-six.vercel.app/api/ingest";
const char *API_KEY = "AxiomSecure_2026_Key";
#define PIN_ADMIN "1212"

// ================== PIN MAPPING ==================
#define PIN_UP 33
#define PIN_DOWN 32
#define PIN_OK 27
#define PIN_BUZZER 13
#define LED_HIJAU 15 // Backlight TFT
#define I2C_SDA 25
#define I2C_SCL 26
#define FP_RX 16
#define FP_TX 17

TFT_eSPI tft = TFT_eSPI();
RTC_DS3231 rtc;
HardwareSerial mySerial(2);
Adafruit_Fingerprint finger = Adafruit_Fingerprint(&mySerial);
WiFiClientSecure client;

enum AppState { STANDBY, INPUT_PIN, MENU, ENROLL, DELETE };
AppState state = STANDBY;
bool isFirstEntry = true;
bool sensorDetected = false;

String statusAbsen[] = {"Check-In", "Check-Out", "Lembur"};
int currentStatusIdx = 0;
int menuIdx = 0;
unsigned long lastActivity = 0;
unsigned long lastScanTime = 0;
bool isLcdOn = true;
int lastFingerID = -1;
unsigned long lastFingerTime = 0;

// ================== PROTOTYPE ==================
void runStandby();
void runInputPin();
void runMenu();
void runEnroll();
void runDelete();
void changeState(AppState newState);
void flashScreen(uint16_t warna, String msg, int id);
void playBuzzer(int p);
void wakeUpLcd();
void updateRTCfromNTP();
void sendDataToAPI(int id, String status);
void syncOfflineData();
bool waitFinger(uint8_t target, uint32_t timeout = 10000);

// ================== SETUP ==================
void setup() {
  Serial.begin(115200);
  mySerial.begin(57600, SERIAL_8N1, FP_RX, FP_TX);
  Wire.begin(I2C_SDA, I2C_SCL);

  pinMode(PIN_UP, INPUT_PULLUP);
  pinMode(PIN_DOWN, INPUT_PULLUP);
  pinMode(PIN_OK, INPUT_PULLUP);
  pinMode(PIN_BUZZER, OUTPUT);
  pinMode(LED_HIJAU, OUTPUT);
  digitalWrite(LED_HIJAU, HIGH);

  tft.init();
  tft.setRotation(0);
  tft.fillScreen(TFT_BLACK);
  tft.setTextColor(TFT_CYAN);
  tft.setTextDatum(MC_DATUM);
  tft.drawString("AXIOM BOOTING", 120, 80, 4);

  LittleFS.begin(true);
  rtc.begin();

  // Cek Sensor
  if (finger.verifyPassword()) {
    sensorDetected = true;
    tft.setTextColor(TFT_GREEN);
    tft.drawString("SENSOR OK!", 120, 120, 2);
  } else {
    sensorDetected = false;
    tft.setTextColor(TFT_RED);
    tft.drawString("SENSOR ERROR!", 120, 120, 2);
    playBuzzer(2);
  }
  delay(1000);

  // WiFi
  tft.fillRect(0, 150, 240, 50, TFT_BLACK);
  tft.setTextColor(TFT_WHITE);
  tft.drawString("WiFi: CONNECTING...", 120, 170, 2);

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  unsigned long startWiFi = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - startWiFi < 8000) {
    delay(500);
    Serial.print(".");
  }

  if (WiFi.status() == WL_CONNECTED) {
    tft.fillRect(0, 150, 240, 50, TFT_BLACK);
    tft.setTextColor(TFT_GREEN);
    tft.drawString("CONNECTED!", 120, 170, 2);

    // Setup OTA
    ArduinoOTA.setHostname("axiom-esp32");
    ArduinoOTA.setPassword("admin"); // Password untuk upload OTA

    ArduinoOTA.onStart([]() {
      String type =
          (ArduinoOTA.getCommand() == U_FLASH) ? "sketch" : "filesystem";
      tft.fillScreen(TFT_BLACK);
      tft.setTextColor(TFT_YELLOW);
      tft.drawString("UPDATING...", 120, 120, 4);
    });

    ArduinoOTA.onEnd([]() {
      tft.fillScreen(TFT_BLACK);
      tft.setTextColor(TFT_GREEN);
      tft.drawString("UPDATE SUKSES", 120, 120, 4);
      delay(1000);
    });

    ArduinoOTA.onProgress([](unsigned int progress, unsigned int total) {
      tft.fillRect(20, 140, 200, 20, TFT_BLACK);
      int barWidth = (progress / (total / 100)) * 2;
      tft.drawRect(20, 140, 200, 20, TFT_WHITE);
      tft.fillRect(20, 140, barWidth, 20, TFT_GREEN);
    });

    ArduinoOTA.onError([](ota_error_t error) {
      tft.fillScreen(TFT_BLACK);
      tft.setTextColor(TFT_RED);
      tft.drawString("UPDATE GAGAL", 120, 120, 4);
      delay(2000);
    });

    ArduinoOTA.begin();

    tft.setTextColor(TFT_YELLOW);
    tft.drawString("Syncing Time...", 120, 195, 2);
    updateRTCfromNTP();
    delay(1000);
  } else {
    tft.fillRect(0, 150, 240, 50, TFT_BLACK);
    tft.setTextColor(TFT_RED);
    tft.drawString("OFFLINE MODE", 120, 170, 2);
    delay(1500);
  }

  client.setInsecure();
  changeState(STANDBY);
}

// ================== LOOP ==================
void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    ArduinoOTA.handle();
  }

  // Backlight timeout 5 menit
  if (millis() - lastActivity > 300000 && isLcdOn) {
    digitalWrite(LED_HIJAU, LOW);
    isLcdOn = false;
  }

  if (!digitalRead(PIN_UP) || !digitalRead(PIN_DOWN) || !digitalRead(PIN_OK)) {
    if (!isLcdOn)
      wakeUpLcd();
    lastActivity = millis();
  }

  // Long press UP = sync offline
  if (state == STANDBY && !digitalRead(PIN_UP)) {
    uint32_t t = millis();
    while (!digitalRead(PIN_UP))
      ;
    if (millis() - t > 3000)
      syncOfflineData();
  }

  switch (state) {
  case STANDBY:
    runStandby();
    break;
  case INPUT_PIN:
    runInputPin();
    break;
  case MENU:
    runMenu();
    break;
  case ENROLL:
    runEnroll();
    break;
  case DELETE:
    runDelete();
    break;
  }
  yield();
}

// ================== STANDBY MODE ==================
void runStandby() {
  DateTime now = rtc.now();
  static int lastSec = -1, lastMin = -1, lastStatus = -1, lastWifi = -1;

  if (isFirstEntry) {
    tft.fillScreen(TFT_BLACK);
    tft.fillRect(0, 0, 240, 50, 0x2104);
    tft.fillRoundRect(5, 5, 40, 40, 8, TFT_CYAN);
    tft.setTextColor(TFT_WHITE);
    tft.setCursor(12, 18);
    tft.setTextSize(2);
    tft.print("AX");
    tft.setTextSize(1);
    tft.setTextDatum(MC_DATUM);
    tft.drawString("AXIOM ID", 140, 25, 2);
    isFirstEntry = false;
    lastSec = -1;
    lastMin = -1;
    lastStatus = -1;
    lastWifi = -1;
  }

  // Jam Besar & Detik
  if (now.minute() != lastMin) {
    tft.fillRect(5, 55, 200, 90, TFT_BLACK);
    char hmBuf[6];
    sprintf(hmBuf, "%02d:%02d", now.hour(), now.minute());
    tft.setTextColor(0x07FF, TFT_BLACK);
    tft.setTextDatum(MC_DATUM);
    tft.setTextSize(3);                 // Manual size scaling
    tft.drawString(hmBuf, 105, 100, 4); // Font 4 with size 3
    tft.setTextSize(1);                 // Reset
    lastMin = now.minute();
  }
  if (now.second() != lastSec) {
    tft.fillRect(5, 120, 200, 25, TFT_BLACK);
    char secBuf[4];
    sprintf(secBuf, ":%02d", now.second());
    tft.setTextColor(TFT_CYAN, TFT_BLACK);
    tft.setTextDatum(MC_DATUM);
    tft.drawString(secBuf, 120, 132, 2); // Smaller font for seconds
    lastSec = now.second();
  }

  // Status Box
  if (currentStatusIdx != lastStatus) {
    tft.fillRoundRect(5, 150, 230, 50, 10, 0x5DFF);
    tft.setTextColor(TFT_WHITE, 0x5DFF);
    tft.setTextDatum(MC_DATUM);
    tft.drawString(statusAbsen[currentStatusIdx], 120, 175, 4);

    tft.fillRect(0, 202, 240, 12, TFT_BLACK);
    if (!sensorDetected) {
      tft.setTextColor(TFT_RED, TFT_BLACK);
      tft.drawString("-- SENSOR ERROR --", 120, 208, 1);
    }
    lastStatus = currentStatusIdx;
  }

  // WiFi Status
  int currentWifi = (WiFi.status() == WL_CONNECTED) ? 1 : 0;
  if (currentWifi != lastWifi) {
    tft.fillRect(0, 215, 240, 25, TFT_BLACK);
    tft.setTextDatum(BL_DATUM);
    if (currentWifi) {
      tft.setTextColor(TFT_YELLOW, TFT_BLACK);
      tft.drawString(WiFi.localIP().toString(), 5, 235, 2);
    } else {
      tft.setTextColor(TFT_DARKGREY, TFT_BLACK);
      tft.drawString("no-ip", 5, 235, 2);
    }
    tft.setTextDatum(BR_DATUM);
    tft.setTextColor(currentWifi ? TFT_GREEN : TFT_RED, TFT_BLACK);
    tft.drawString(currentWifi ? "ONLINE" : "OFFLINE", 235, 235, 2);
    lastWifi = currentWifi;
  }

  // Scan Fingerprint
  if (sensorDetected && (millis() - lastScanTime > 200)) {
    lastScanTime = millis();
    if (finger.getImage() == FINGERPRINT_OK) {
      playBuzzer(1);
      tft.fillRoundRect(5, 150, 230, 50, 10, TFT_YELLOW);
      tft.setTextColor(TFT_BLACK, TFT_YELLOW);
      tft.setTextDatum(MC_DATUM);
      tft.drawString("MEMINDAI...", 120, 175, 4);

      if (finger.image2Tz() == FINGERPRINT_OK) {
        if (finger.fingerFastSearch() == FINGERPRINT_OK) {
          if (finger.fingerID == lastFingerID &&
              millis() - lastFingerTime < 60000) {
            flashScreen(TFT_YELLOW, "SUDAH ABSEN", finger.fingerID);
          } else {
            lastFingerID = finger.fingerID;
            lastFingerTime = millis();
            flashScreen(TFT_GREEN, "BERHASIL", finger.fingerID);
            sendDataToAPI(finger.fingerID, statusAbsen[currentStatusIdx]);
          }
        } else {
          playBuzzer(2);
          flashScreen(TFT_RED, "JARI ASING", 0);
        }
      }
      changeState(STANDBY);
    }
  }

  // Navigation
  if (!digitalRead(PIN_UP)) {
    currentStatusIdx = (currentStatusIdx + 2) % 3;
    delay(200);
  }
  if (!digitalRead(PIN_DOWN)) {
    currentStatusIdx = (currentStatusIdx + 1) % 3;
    delay(200);
  }
  if (!digitalRead(PIN_OK)) {
    changeState(INPUT_PIN);
    delay(200);
  }
}

// ================== SEND TO VERCEL API ==================
void sendDataToAPI(int id, String status) {
  // Get timestamp from RTC
  DateTime now = rtc.now();
  char timestamp[25];
  sprintf(timestamp, "%04d-%02d-%02dT%02d:%02d:%02d.000Z", now.year(),
          now.month(), now.day(), now.hour(), now.minute(), now.second());

  String dataKirim = String(id) + "," + String(timestamp) + "," + status;

  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient https;
    https.begin(client, API_URL);
    https.addHeader("Content-Type", "application/json");
    https.addHeader("x-api-key", API_KEY);

    JsonDocument doc;
    doc["uid"] = id;
    doc["timestamp"] = String(timestamp);

    String jsonPayload;
    serializeJson(doc, jsonPayload);

    int httpCode = https.POST(jsonPayload);
    Serial.printf("HTTP Response: %d\n", httpCode);
    https.end();
  } else {
    // Offline mode - save to LittleFS
    fs::File f = LittleFS.open("/offline.txt", FILE_APPEND);
    if (f) {
      f.println(dataKirim);
      f.close();
    }
  }
}

// ================== HELPER FUNCTIONS ==================
void updateRTCfromNTP() {
  configTime(25200, 0, "id.pool.ntp.org", "pool.ntp.org");
  struct tm t;
  if (getLocalTime(&t, 5000)) {
    rtc.adjust(DateTime(t.tm_year + 1900, t.tm_mon + 1, t.tm_mday, t.tm_hour,
                        t.tm_min, t.tm_sec));
  }
}

void flashScreen(uint16_t warna, String msg, int id) {
  tft.fillScreen(warna);
  tft.setTextColor(TFT_BLACK);
  tft.setTextDatum(MC_DATUM);
  tft.drawString(msg, 120, 100, 4);
  if (id > 0)
    tft.drawString("ID " + String(id), 120, 145, 2);
  delay(1500);
}

void syncOfflineData() {
  if (WiFi.status() != WL_CONNECTED) {
    flashScreen(TFT_RED, "OFFLINE", 0);
    changeState(STANDBY);
    return;
  }
  tft.fillScreen(TFT_BLACK);
  tft.drawString("SINKRONISASI...", 120, 120, 2);

  fs::File f = LittleFS.open("/offline.txt", FILE_READ);
  if (f) {
    HTTPClient https;
    https.begin(client, API_URL);
    https.addHeader("Content-Type", "application/json");
    https.addHeader("x-api-key", API_KEY);

    while (f.available()) {
      String line = f.readStringUntil('\n');
      int idx1 = line.indexOf(',');
      int idx2 = line.indexOf(',', idx1 + 1);

      if (idx1 > 0 && idx2 > 0) {
        int uid = line.substring(0, idx1).toInt();
        String timestamp = line.substring(idx1 + 1, idx2);

        JsonDocument doc;
        doc["uid"] = uid;
        doc["timestamp"] = timestamp;

        String payload;
        serializeJson(doc, payload);
        https.POST(payload);
        delay(100);
      }
      yield();
    }
    https.end();
    f.close();
    LittleFS.remove("/offline.txt");
    flashScreen(TFT_GREEN, "SYNC OK", 0);
  }
  changeState(STANDBY);
}

void playBuzzer(int p) {
  digitalWrite(PIN_BUZZER, HIGH);
  delay(p == 1 ? 150 : 300);
  digitalWrite(PIN_BUZZER, LOW);
}

void wakeUpLcd() {
  lastActivity = millis();
  digitalWrite(LED_HIJAU, HIGH);
  isLcdOn = true;
  delay(200);
}

void changeState(AppState newState) {
  state = newState;
  isFirstEntry = true;
}

void runInputPin() {
  static String enteredPin = "";
  static int curDigit = 0;
  if (isFirstEntry) {
    tft.fillScreen(TFT_BLACK);
    tft.setTextColor(TFT_WHITE);
    tft.setTextDatum(MC_DATUM);
    tft.drawString("PIN ADMIN", 120, 40, 2);
    isFirstEntry = false;
  }
  tft.fillRect(60, 100, 120, 40, TFT_BLACK);
  String disp = "";
  for (int i = 0; i < 4; i++)
    disp += (i < (int)enteredPin.length()) ? "*" : "-";
  tft.drawString(disp, 120, 115, 4);
  tft.fillRect(80, 170, 80, 30, TFT_BLACK);
  tft.drawString("Digit: " + String(curDigit), 120, 185, 2);

  if (!digitalRead(PIN_UP)) {
    curDigit = (curDigit + 1) % 10;
    delay(200);
  }
  if (!digitalRead(PIN_DOWN)) {
    curDigit = (curDigit + 9) % 10;
    delay(200);
  }
  if (!digitalRead(PIN_OK)) {
    enteredPin += String(curDigit);
    curDigit = 0;
    delay(250);
    if (enteredPin.length() == 4) {
      if (enteredPin == PIN_ADMIN)
        changeState(MENU);
      else {
        flashScreen(TFT_RED, "SALAH", 0);
        changeState(STANDBY);
      }
      enteredPin = "";
    }
  }
}

void runMenu() {
  if (isFirstEntry) {
    tft.fillScreen(TFT_BLACK);
    isFirstEntry = false;
  }
  String items[] = {"DAFTAR JARI", "HAPUS JARI", "KEMBALI"};
  for (int i = 0; i < 3; i++) {
    tft.fillRoundRect(15, 70 + (i * 50), 210, 40, 8,
                      (i == menuIdx) ? 0x5DFF : 0x2104);
    tft.setTextColor(TFT_WHITE);
    tft.drawString(items[i], 120, 90 + (i * 50), 2);
  }
  if (!digitalRead(PIN_UP)) {
    menuIdx = (menuIdx + 2) % 3;
    delay(200);
  }
  if (!digitalRead(PIN_DOWN)) {
    menuIdx = (menuIdx + 1) % 3;
    delay(200);
  }
  if (!digitalRead(PIN_OK)) {
    delay(250);
    if (menuIdx == 0)
      changeState(ENROLL);
    else if (menuIdx == 1)
      changeState(DELETE);
    else
      changeState(STANDBY);
  }
}

void runEnroll() {
  if (!sensorDetected) {
    flashScreen(TFT_RED, "NO SENSOR", 0);
    changeState(MENU);
    return;
  }
  static int id = 1;
  if (isFirstEntry) {
    tft.fillScreen(TFT_BLACK);
    tft.drawString("SET ID: " + String(id), 120, 80, 2);
    isFirstEntry = false;
  }
  if (!digitalRead(PIN_UP)) {
    id++;
    tft.fillRect(110, 70, 60, 30, TFT_BLACK);
    tft.drawString(String(id), 130, 80, 2);
    delay(200);
  }
  if (!digitalRead(PIN_DOWN) && id > 1) {
    id--;
    tft.fillRect(110, 70, 60, 30, TFT_BLACK);
    tft.drawString(String(id), 130, 80, 2);
    delay(200);
  }
  if (!digitalRead(PIN_OK)) {
    tft.fillScreen(TFT_BLACK);
    tft.drawString("Tempel Jari", 120, 120, 2);
    if (waitFinger(FINGERPRINT_OK)) {
      finger.image2Tz(1);
      delay(1000);
      tft.fillScreen(TFT_BLACK);
      tft.drawString("Tempel Lagi", 120, 120, 2);
      if (waitFinger(FINGERPRINT_OK)) {
        finger.image2Tz(2);
        if (finger.createModel() == FINGERPRINT_OK &&
            finger.storeModel(id) == FINGERPRINT_OK)
          flashScreen(TFT_GREEN, "SUKSES", id);
        else
          flashScreen(TFT_RED, "GAGAL", 0);
      }
    }
    changeState(MENU);
  }
}

void runDelete() {
  if (!sensorDetected) {
    flashScreen(TFT_RED, "NO SENSOR", 0);
    changeState(MENU);
    return;
  }
  static int id = 1;
  if (isFirstEntry) {
    tft.fillScreen(TFT_BLACK);
    tft.drawString("HAPUS ID: " + String(id), 120, 100, 2);
    isFirstEntry = false;
  }
  if (!digitalRead(PIN_UP)) {
    id++;
    tft.fillRect(110, 90, 60, 30, TFT_BLACK);
    tft.drawString(String(id), 130, 100, 2);
    delay(200);
  }
  if (!digitalRead(PIN_DOWN) && id > 1) {
    id--;
    tft.fillRect(110, 90, 60, 30, TFT_BLACK);
    tft.drawString(String(id), 130, 100, 2);
    delay(200);
  }
  if (!digitalRead(PIN_OK)) {
    if (finger.deleteModel(id) == FINGERPRINT_OK)
      flashScreen(TFT_RED, "TERHAPUS", id);
    changeState(MENU);
  }
}

bool waitFinger(uint8_t target, uint32_t timeout) {
  uint32_t start = millis();
  while (millis() - start < timeout) {
    if (finger.getImage() == target)
      return true;
    delay(50);
    yield();
  }
  return false;
}
