#include <Adafruit_Fingerprint.h>
#include <Arduino.h>
#include <ArduinoJson.h>
#include <Arduino_GFX_Library.h>
#include <HTTPClient.h>
#include <RTClib.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>

// ============ CONFIGURATION ============
// WiFi Credentials
const char *WIFI_SSID = "realme GT Neo2 5G";
const char *WIFI_PASSWORD = "Nyorean9";

// API Configuration
const char *API_URL = "https://safira.my.id/api/ingest";
const char *API_KEY = "YOUR_API_KEY_HERE"; // Copy from .env.local

// Hardware Serial for AS608 (TX2=GPIO17, RX2=GPIO16)
HardwareSerial mySerial(2);
Adafruit_Fingerprint finger = Adafruit_Fingerprint(&mySerial);

// RTC (I2C: SDA=GPIO21, SCL=GPIO22)
RTC_DS3231 rtc;

// WiFi Client
WiFiClientSecure client;

// TFT Display ST7789 1.3" (SPI)
// MOSI=GPIO23, SCK=GPIO18, CS=GPIO5, DC=GPIO2, RST=GPIO4, BL=GPIO15
Arduino_DataBus *bus = new Arduino_ESP32SPI(
    2 /* DC */, 5 /* CS */, 18 /* SCK */, 23 /* MOSI */, -1 /* MISO */);
Arduino_ST7789 *gfx =
    new Arduino_ST7789(bus, 4 /* RST */, 0 /* rotation */, true /* IPS */,
                       240 /* width */, 240 /* height */);

#define TFT_BL 15

// Button Pins
#define BTN_UP 25
#define BTN_SELECT 26
#define BTN_DOWN 27

// UI Colors (Dark Theme)
#define COLOR_BG 0x0000      // Black
#define COLOR_PRIMARY 0x07FF // Cyan
#define COLOR_SUCCESS 0x07E0 // Green
#define COLOR_ERROR 0xF800   // Red
#define COLOR_TEXT 0xFFFF    // White
#define COLOR_GRAY 0x7BEF    // Light Gray

// Menu State
enum MenuState { MENU_MAIN, MENU_CHECKIN, MENU_CHECKOUT, MENU_ENROLL };
MenuState currentMenu = MENU_MAIN;
int menuSelection = 0;

// ============ FUNCTION DECLARATIONS ============
void connectWiFi();
void reconnectWiFi();
bool sendToAPI(int uid, String timestamp);
int getFingerprintID();
String getRTCTimestamp();
void initDisplay();
void showMainMenu();
void showScanScreen(const char *title);
void showProcessing();
void showSuccess(const char *name);
void showError(const char *message);
void handleButtons();
void drawCenteredText(const char *text, int y, uint16_t color, int size);
void drawFingerIcon(int x, int y, uint16_t color);
void drawCheckmark(int x, int y);
void drawX(int x, int y);

// ============ SETUP ============
void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("\n=== ESP32 Fingerprint Attendance System ===");

  // Initialize TFT Display
  initDisplay();

  // Initialize Buttons
  pinMode(BTN_UP, INPUT_PULLUP);
  pinMode(BTN_SELECT, INPUT_PULLUP);
  pinMode(BTN_DOWN, INPUT_PULLUP);

  // Initialize WiFi
  drawCenteredText("Connecting WiFi...", 120, COLOR_PRIMARY, 2);
  connectWiFi();

  // Initialize AS608 Fingerprint Sensor
  mySerial.begin(57600, SERIAL_8N1, 16, 17);
  Serial.println("Initializing AS608 sensor...");

  if (finger.verifyPassword()) {
    Serial.println("✓ AS608 sensor found!");
  } else {
    Serial.println("✗ AS608 sensor not found!");
    showError("Sensor Error");
    while (1)
      delay(1);
  }

  // Initialize DS3231 RTC
  Serial.println("Initializing DS3231 RTC...");
  if (!rtc.begin()) {
    Serial.println("✗ RTC not found!");
    showError("RTC Error");
    while (1)
      delay(1);
  }

  if (rtc.lostPower()) {
    Serial.println("! RTC lost power, setting time...");
    rtc.adjust(DateTime(F(__DATE__), F(__TIME__)));
  }

  Serial.println("✓ System Ready!");
  showMainMenu();
}

// ============ MAIN LOOP ============
void loop() {
  // Check WiFi connection
  if (WiFi.status() != WL_CONNECTED) {
    reconnectWiFi();
  }

  // Handle button navigation
  handleButtons();

  delay(50);
}

// ============ DISPLAY FUNCTIONS ============
void initDisplay() {
  pinMode(TFT_BL, OUTPUT);
  digitalWrite(TFT_BL, HIGH); // Backlight ON

  gfx->begin();
  gfx->fillScreen(COLOR_BG);
  gfx->setTextColor(COLOR_TEXT);

  drawCenteredText("AXIOM", 80, COLOR_PRIMARY, 3);
  drawCenteredText("Initializing...", 120, COLOR_TEXT, 2);
  delay(1500);
}

void showMainMenu() {
  currentMenu = MENU_MAIN;
  gfx->fillScreen(COLOR_BG);

  drawCenteredText("MAIN MENU", 20, COLOR_PRIMARY, 2);

  // Menu items
  gfx->setTextSize(2);
  gfx->setTextColor(menuSelection == 0 ? COLOR_PRIMARY : COLOR_GRAY);
  gfx->setCursor(40, 80);
  gfx->print(menuSelection == 0 ? "> " : "  ");
  gfx->print("Check-in");

  gfx->setTextColor(menuSelection == 1 ? COLOR_PRIMARY : COLOR_GRAY);
  gfx->setCursor(40, 110);
  gfx->print(menuSelection == 1 ? "> " : "  ");
  gfx->print("Check-out");

  gfx->setTextColor(menuSelection == 2 ? COLOR_PRIMARY : COLOR_GRAY);
  gfx->setCursor(40, 140);
  gfx->print(menuSelection == 2 ? "> " : "  ");
  gfx->print("Enroll New");

  gfx->setTextSize(1);
  gfx->setTextColor(COLOR_GRAY);
  gfx->setCursor(30, 210);
  gfx->print("UP/DOWN: Navigate");
  gfx->setCursor(30, 225);
  gfx->print("SELECT: Confirm");
}

void showScanScreen(const char *title) {
  gfx->fillScreen(COLOR_BG);
  drawCenteredText(title, 20, COLOR_PRIMARY, 2);
  drawFingerIcon(95, 80, COLOR_PRIMARY);
  drawCenteredText("Place Finger", 180, COLOR_TEXT, 2);

  // Wait for fingerprint
  Serial.println("Waiting for fingerprint...");

  while (true) {
    int fingerprintID = getFingerprintID();

    if (fingerprintID > 0) {
      showProcessing();
      delay(500);

      String timestamp = getRTCTimestamp();
      bool success = sendToAPI(fingerprintID, timestamp);

      if (success) {
        showSuccess("Access Granted");
      } else {
        showError("API Error");
      }

      delay(2000);
      showMainMenu();
      return;
    } else if (fingerprintID == 0) {
      showError("Unknown Finger");
      delay(2000);
      showMainMenu();
      return;
    }

    // Check for back button
    if (digitalRead(BTN_SELECT) == LOW) {
      delay(200);
      showMainMenu();
      return;
    }

    delay(50);
  }
}

void showProcessing() {
  gfx->fillScreen(COLOR_BG);
  drawCenteredText("PROCESSING", 100, COLOR_PRIMARY, 2);

  // Simple spinner animation
  for (int i = 0; i < 8; i++) {
    gfx->fillCircle(120, 140 + i * 2, 3, COLOR_PRIMARY);
    delay(50);
  }
}

void showSuccess(const char *name) {
  gfx->fillScreen(COLOR_BG);
  drawCheckmark(95, 70);
  drawCenteredText("SUCCESS", 150, COLOR_SUCCESS, 3);
  drawCenteredText(name, 190, COLOR_TEXT, 2);
}

void showError(const char *message) {
  gfx->fillScreen(COLOR_BG);
  drawX(95, 70);
  drawCenteredText("ERROR", 150, COLOR_ERROR, 3);
  drawCenteredText(message, 190, COLOR_TEXT, 2);
}

void drawCenteredText(const char *text, int y, uint16_t color, int size) {
  gfx->setTextSize(size);
  gfx->setTextColor(color);
  int16_t x1, y1;
  uint16_t w, h;
  gfx->getTextBounds(text, 0, 0, &x1, &y1, &w, &h);
  gfx->setCursor((240 - w) / 2, y);
  gfx->print(text);
}

void drawFingerIcon(int x, int y, uint16_t color) {
  // Simple fingerprint icon
  gfx->fillRoundRect(x, y, 50, 70, 10, color);
  gfx->fillRect(x + 10, y + 10, 30, 50, COLOR_BG);

  // Fingerprint lines
  for (int i = 0; i < 4; i++) {
    gfx->drawLine(x + 15, y + 20 + i * 10, x + 35, y + 20 + i * 10, color);
  }
}

void drawCheckmark(int x, int y) {
  gfx->fillCircle(x + 25, y + 25, 40, COLOR_SUCCESS);
  gfx->drawLine(x + 10, y + 25, x + 20, y + 40, COLOR_BG);
  gfx->drawLine(x + 20, y + 40, x + 45, y + 10, COLOR_BG);
  gfx->drawLine(x + 11, y + 25, x + 21, y + 40, COLOR_BG);
  gfx->drawLine(x + 21, y + 40, x + 46, y + 10, COLOR_BG);
}

void drawX(int x, int y) {
  gfx->fillCircle(x + 25, y + 25, 40, COLOR_ERROR);
  gfx->drawLine(x + 10, y + 10, x + 40, y + 40, COLOR_BG);
  gfx->drawLine(x + 40, y + 10, x + 10, y + 40, COLOR_BG);
  gfx->drawLine(x + 11, y + 10, x + 41, y + 40, COLOR_BG);
  gfx->drawLine(x + 41, y + 10, x + 11, y + 40, COLOR_BG);
}

// ============ BUTTON HANDLER ============
void handleButtons() {
  static unsigned long lastPress = 0;
  unsigned long now = millis();

  if (now - lastPress < 200)
    return; // Debounce

  if (currentMenu == MENU_MAIN) {
    if (digitalRead(BTN_UP) == LOW) {
      menuSelection = (menuSelection - 1 + 3) % 3;
      showMainMenu();
      lastPress = now;
    } else if (digitalRead(BTN_DOWN) == LOW) {
      menuSelection = (menuSelection + 1) % 3;
      showMainMenu();
      lastPress = now;
    } else if (digitalRead(BTN_SELECT) == LOW) {
      lastPress = now;

      switch (menuSelection) {
      case 0:
        showScanScreen("CHECK-IN");
        break;
      case 1:
        showScanScreen("CHECK-OUT");
        break;
      case 2:
        gfx->fillScreen(COLOR_BG);
        drawCenteredText("ENROLL", 100, COLOR_PRIMARY, 2);
        drawCenteredText("Not Implemented", 140, COLOR_GRAY, 2);
        delay(2000);
        showMainMenu();
        break;
      }
    }
  }
}

// ============ WIFI FUNCTIONS ============
void connectWiFi() {
  Serial.print("Connecting to WiFi: ");
  Serial.println(WIFI_SSID);

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✓ WiFi connected!");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n✗ WiFi connection failed!");
  }
}

void reconnectWiFi() {
  Serial.println("WiFi disconnected. Reconnecting...");
  WiFi.disconnect();
  delay(100);
  connectWiFi();
}

// ============ FINGERPRINT FUNCTIONS ============
int getFingerprintID() {
  uint8_t p = finger.getImage();

  if (p != FINGERPRINT_OK)
    return -1;

  p = finger.image2Tz();
  if (p != FINGERPRINT_OK)
    return -1;

  p = finger.fingerSearch();
  if (p == FINGERPRINT_OK) {
    return finger.fingerID;
  } else if (p == FINGERPRINT_NOTFOUND) {
    return 0; // No match
  } else {
    return -1;
  }
}

// ============ RTC FUNCTIONS ============
String getRTCTimestamp() {
  DateTime now = rtc.now();

  char buffer[25];
  sprintf(buffer, "%04d-%02d-%02dT%02d:%02d:%02d.000Z", now.year(), now.month(),
          now.day(), now.hour(), now.minute(), now.second());

  return String(buffer);
}

// ============ API FUNCTIONS ============
bool sendToAPI(int uid, String timestamp) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("✗ WiFi not connected");
    return false;
  }

  HTTPClient https;

  https.begin(client, API_URL);
  https.addHeader("Content-Type", "application/json");
  https.addHeader("x-api-key", API_KEY);

  JsonDocument doc;
  doc["uid"] = uid;
  doc["timestamp"] = timestamp;

  String jsonPayload;
  serializeJson(doc, jsonPayload);

  Serial.print("Payload: ");
  Serial.println(jsonPayload);

  int httpResponseCode = https.POST(jsonPayload);

  bool success = false;
  if (httpResponseCode > 0) {
    Serial.print("HTTP Response code: ");
    Serial.println(httpResponseCode);

    String response = https.getString();
    Serial.print("Response: ");
    Serial.println(response);

    success = (httpResponseCode == 200);
  } else {
    Serial.print("✗ Error code: ");
    Serial.println(httpResponseCode);
  }

  https.end();
  return success;
}
