// TFT_eSPI User Setup for ST7789 240x240 Display
// Copy this to your Arduino/libraries/TFT_eSPI/User_Setup.h
// OR create User_Setup_Select.h and include this file

#define ST7789_DRIVER // Configure for ST7789 display

#define TFT_WIDTH 240
#define TFT_HEIGHT 240

// Pin configuration for ESP32
#define TFT_MOSI 23
#define TFT_SCLK 18
#define TFT_CS 5
#define TFT_DC 2
#define TFT_RST 4
#define TFT_BL 15 // Backlight control

// Fonts
#define LOAD_GLCD // Font 1. Original Adafruit 8 pixel font needs ~1820 bytes in
                  // FLASH
#define LOAD_FONT2 // Font 2. Small 16 pixel high font, needs ~3534 bytes in
                   // FLASH
#define LOAD_FONT4 // Font 4. Medium 26 pixel high font, needs ~5848 bytes in
                   // FLASH
#define LOAD_FONT6 // Font 6. Large 48 pixel font, needs ~2666 bytes in FLASH
#define LOAD_FONT7 // Font 7. 7 segment 48 pixel font, needs ~2438 bytes in
                   // FLASH
#define LOAD_FONT8 // Font 8. Large 75 pixel font needs ~3256 bytes in FLASH

#define SMOOTH_FONT

#define SPI_FREQUENCY 27000000
#define SPI_READ_FREQUENCY 20000000
#define SPI_TOUCH_FREQUENCY 2500000
