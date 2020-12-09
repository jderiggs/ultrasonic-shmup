
#include <NewPing.h>

#define SONAR_NUM 2      // Number of sensors.
#define MAX_DISTANCE 9 // Maximum distance we want to ping for (in centimeters). Maximum sensor distance is rated at 400-500cm.

NewPing sonar[SONAR_NUM] = {
NewPing(3, 2, MAX_DISTANCE), // NewPing setup of pins and maximum distance.
NewPing(12, 11, MAX_DISTANCE) // NewPing setup of pins and maximum distance.
};

void setup() {
  Serial.begin(115200); // Open serial monitor at 115200 baud to see ping results.
}

void loop() { 
  
  for (uint8_t i = 0; i < SONAR_NUM; i++) { // Loop through each sensor and display results.
    delay(100); // Wait 50ms between pings (about 20 pings/sec). 29ms should be the shortest delay between pings.
    //Serial.print();
    //Serial.print("=");
    Serial.print(sonar[i].ping_cm());
    Serial.print(",");
  }
  Serial.println();
}
