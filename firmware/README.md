# ESP32 Fingerprint Attendance Firmware

## Hardware Requirements
- **MCU**: ESP32 DevKit V1
- **Fingerprint Sensor**: AS608 (UART)
- **RTC Module**: DS3231 (I2C)

## Wiring Diagram

### AS608 Fingerprint Sensor (UART2)
- VCC → 3.3V
- GND → GND
- TX → GPIO16 (RX2)
- RX → GPIO17 (TX2)

### DS3231 RTC Module (I2C)
- VCC → 3.3V
- GND → GND
- SDA → GPIO21
- SCL → GPIO22

### ST7789 TFT Display (SPI)
- VCC → 3.3V
- GND → GND
- SCL → GPIO18
- SDA → GPIO23
- RES → GPIO4
- DC → GPIO2
- CS → GPIO5
- BL → GPIO15

### Navigation Buttons
- Button UP → GPIO25 (with pull-up)
- Button SELECT → GPIO26 (with pull-up)
- Button DOWN → GPIO27 (with pull-up)

## Setup Instructions

1. **Install PlatformIO**
   - Install VS Code with PlatformIO extension
   - Or use PlatformIO CLI

2. **Configure WiFi and API**
   - Open `firmware/src/main.cpp`
   - Update the following constants:
     ```cpp
     const char* WIFI_SSID = "YOUR_WIFI_SSID";
     const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
     const char* API_KEY = "YOUR_API_KEY_HERE"; // From .env.local
     ```

3. **Upload Firmware**
   ```bash
   cd firmware
   pio run --target upload
   pio device monitor
   ```

## Features
- ✅ WiFi connection with auto-reconnect
- ✅ AS608 fingerprint scanning and matching
- ✅ DS3231 RTC for accurate timestamps
- ✅ HTTPS POST to backend API
- ✅ JSON payload formatting
- ✅ **ST7789 1.3" TFT Display with dark theme UI**
- ✅ **3-button navigation system**
- ✅ **Menu options: Check-in, Check-out, Enroll**
- ✅ **Visual feedback: Success/Error screens with icons**

## API Communication
Sends POST request to `https://safira.my.id/api/ingest` with:
```json
{
  "uid": 1,
  "timestamp": "2026-01-02T14:30:45.000Z"
}
```

## Security Note
⚠️ Current implementation uses `client.setInsecure()` for HTTPS.  
For production, add root CA certificate verification.
