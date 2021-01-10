#include <NewPing.h>
#include <Servo.h>
#define trig_pin1 6
#define echo_pin1 7
#define trig_pin2 8
#define echo_pin2 9
#define MAX_DISTANCE 100 
unsigned int dist1, dist2;

NewPing sonar1(trig_pin1, echo_pin1, MAX_DISTANCE); // Each sensor's trigger pin, echo pin, and max distance to ping. 
NewPing sonar2(trig_pin2, echo_pin2, MAX_DISTANCE);

Servo myservo1; //creates a servo object
Servo myservo2; //creates a servo object
                         //a maximum of eight servo objects can be created

int pos = 0;        //variable to store servo position

//amount of time we give the sensor to calibrate(10-60 secs according to the datasheet)

int calibrationTime = 10;

int pirPin1 = 12;             //digital pin1 connected to the PIR's output
int pirPin2 = 11;            //digital pin2 connected to the PIR's output
int pirPos1 = 10;
int pirPos2 = 13;           //connects to the PIR's 5V pin

void setup(){
  myservo1.attach(4);    //attaches servo1 to pin 4
  myservo2.attach(5);   //attaches servo2 to pin 5
  Serial.begin(9600);    //begins serial communication
  pinMode(pirPin1, INPUT);
  pinMode(pirPin2, INPUT);
  pinMode(pirPos1, OUTPUT);
  pinMode(pirPos2, OUTPUT);
  //pinMode(7, INPUT);
  //pinMode(9, INPUT);
  digitalWrite(pirPos1, HIGH);
  digitalWrite(pirPos2, HIGH);

  //give the sensor time to calibrate
  Serial.println("Calibrating sensor \n");
  for(int i = 0; i < calibrationTime; i++){
    Serial.print(calibrationTime - i);
    Serial.print("-");
    delay(1000);
  }
  Serial.println();
  Serial.println("Done! \n");

  //while making this Instructable, I had some issues with the PIR's output
  //going HIGH immediately after calibrating
  //this waits until the PIR's output is low before ending setup
  while (digitalRead(pirPin1)) {
    delay(500);
    Serial.print(".");     
  }
  Serial.print("SENSOR1 ACTIVE \n");
  while (digitalRead(pirPin2) == HIGH) {
    delay(500);
    Serial.print(".");
  }
  Serial.print("SENSOR2 ACTIVE \n");
}

void loop(){

  Ultra1:if(digitalRead(pirPin1) == HIGH){  //if the PIR output is HIGH, turn servo

    
    for(pos = 0; pos < 100; pos += 1)  //goes from 0 to 100 degrees
    {                                                 //in steps of one degree
      myservo1.write(pos);                   //tells servo to go to position in variable "pos"
      delay(15);                                   //waits for the servo to reach the position
    }
    for(pos = 100; pos>=1; pos-=1)    //goes from 100 to 0 degrees
    {                               
      myservo1.write(pos);                  //to make the servo go faster, decrease the time in delays for
      delay(70);                                  //to make it go slower, increase the number.
    }

    delay(50);
    Serial.println("1=");
    dist1=sonar1.ping_cm();
    Serial.println(dist1);
    delay(500);
  }

  else {
    goto Ultra2;
  }

  
  
  Ultra2: if(digitalRead(pirPin2) == HIGH){  //if the PIR output is HIGH, turn servo

    
    for(pos = 0; pos < 100; pos += 1)  //goes from 0 to 100 degrees
    {                                                 //in steps of one degree
      myservo2.write(pos);                   //tells servo to go to position in variable "pos"
      delay(15);                                   //waits for the servo to reach the position
    }
    for(pos = 100; pos>=1; pos-=1)    //goes from 100 to 0 degrees
    {                               
      myservo2.write(pos);                  //to make the servo go faster, decrease the time in delays for
      delay(70);                                  //to make it go slower, increase the number.
    }

    delay(50);
    Serial.println("2=");
    dist2=sonar2.ping_cm();
    Serial.println(dist2);
    delay(500);
  }

  else {
    goto Ultra1;
  }
  }
