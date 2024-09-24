#include <LiquidCrystal_I2C.h>
#include <Adafruit_Fingerprint.h>
#define LED 4

SoftwareSerial mySerial(2, 3);
Adafruit_Fingerprint finger = Adafruit_Fingerprint(&mySerial);
LiquidCrystal_I2C dis(0x27, 16, 2);

byte ID = 158; // Enter your fingerprint ID
bool Switch = true;

void setup() {
  Serial.begin(9600);
  dis.init();
  dis.backlight();
  dis.setCursor(0, 0);
  dis.print("Place finger");
  pinMode(LED, OUTPUT);
  while (!Serial);  // For Yun/Leo/Micro/Zero/...
  delay(100);
  Serial.println("\n\nAdafruit finger detect test");

  // set the data rate for the sensor serial port
  finger.begin(57600);
  delay(5);
  if (finger.verifyPassword()) {
    Serial.println("Found fingerprint sensor!");
  } else {
    Serial.println("Did not find fingerprint sensor :(");
    while (1) {
      delay(1);
    }
  }

  finger.getParameters();
  finger.getTemplateCount();
  if (finger.templateCount == 0) {
    Serial.print("Sensor doesn't contain any fingerprint data. Please run the 'enroll' example.");
  }
  else {
    Serial.println("Waiting for valid finger...");
    Serial.print("Sensor contains "); Serial.print(finger.templateCount); Serial.println(" templates");
  }
}

void loop() {
  int value = getFingerprintIDez();

  if (value == ID) {
    dis.setCursor(0, 1);
    dis.print("Thank you");
    if (Switch) {
      digitalWrite(LED, HIGH);
      Switch = false;
    } else if (Switch == false) {
      digitalWrite(LED, LOW);
      Switch = true;
    }
    delay(2000);
  } else {
    dis.setCursor(0, 1);
    dis.print("         ");
  }
  delay(50);
}


// returns -1 if failed, otherwise returns ID #
int getFingerprintIDez() {
  uint8_t p = finger.getImage();
  if (p != FINGERPRINT_OK)  return -1;

  p = finger.image2Tz();
  if (p != FINGERPRINT_OK)  return -1;

  p = finger.fingerFastSearch();
  if (p != FINGERPRINT_OK)  return -1;

  return finger.fingerID;
}