#include<ESP8266WiFi.h>
#include<PubSubClient.h>
#include<SoftwareSerial.h>
SoftwareSerial mySerial(D1,D2);

#define ultrasonic_input D2
#define wifi_ssid "Shhh...I'm Batman!"
#define wifi_password "abracadabra#"
#define mqtt_server "192.168.0.106"
#define ultrasonic_topic "ultrasonic"
#define mqttpubQos 2
#define mqttsubQos 1
//const char* mqttServer = "192.168.0.106";
const int mqttPort = 1883;
const char* mqttUser = "roger";
const char* mqttPassword = "password";
  long lastMsg = 0;
  float ultrasonic = 0.0;
  float diff = 1.0; 
  
WiFiClient espClient;
PubSubClient client(espClient);


void setup() {
  Serial.begin(9600);
  mySerial.begin(9600);
  setup_wifi();
  client.setServer(mqtt_server, mqttPort);
  client.setCallback(callback);
  pinMode(ultrasonic_input, INPUT);
}

void setup_wifi() {
  delay(10);
  WiFi.begin(wifi_ssid, wifi_password);
  while (WiFi.status() != WL_CONNECTED)
    delay(500);
  Serial.print("Wifi connected \n");
}
//Serial.println("connected to wifi network");

void reconnect() {
  while (!client.connected()) {
    Serial.print("attempting MQTT connection");
    if (client.connect("ESP8266Client", mqttUser, mqttPassword )) {
      client.subscribe("BinOpen1");
      Serial.println("connected");
    }
    else {
      Serial.print("failed with state ");
      Serial.print(client.state());
      delay(2000);
    }

  }
}
 bool checkBound(float newValue, float prevValue, float maxDiff) {
    return (newValue < prevValue - maxDiff || newValue >  prevValue + maxDiff);
  }

void callback(char* topic, byte* payload, unsigned int length) {
  
  Serial.print(topic)

}

void loop() {
    if (!client.connected()) {
      reconnect();
    }
    
    client.loop();

    long now = millis();
    if (now - lastMsg > 300) {
      lastMsg = now;
 
      String msg=mySerial.readStringUntil('\r');
      Serial.println(msg);
      //if (strcmp(new_msg,msg)!=0);
      //float ultrasonic_new = digitalRead(ultrasonic_input);
      //if (checkBound(msg, ultrasonic, diff)) {
        //ultrasonic = msg;
        //Serial.print("New ultrasonic value:");
        //Serial.println(String(ultrasonic_new).c_str());
        client.publish(ultrasonic_topic, msg.c_str(), true);
        //new_msg = msg;
       
       }
      }
