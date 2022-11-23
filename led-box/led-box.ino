#include <FastLED.h>

// How many leds in your strip?
#define NUM_LEDS 50

#define LEDS_PER_ROW 5
#define NUM_ROWS 10

#define DATA_PIN 2

CRGB leds[NUM_LEDS];

unsigned long last_twinkle = 0;
unsigned long hue = 0;

unsigned long last_msg = 0;

int val = 0;

void fadeAll()  {
  for (int i = 0; i < NUM_LEDS; i++) {
    leds[i].nscale8(250);

  }
  FastLED.show();
}

void light_row(int row, CRGB colour) {

  if (row > NUM_ROWS) {
    return;
  }

  for (int i = 0; i <  LEDS_PER_ROW; i++) {
    int pixel = (LEDS_PER_ROW * row) + i;
    leds[NUM_LEDS - pixel - 1] = colour;
  }

}

void waitFade() {
  while (leds[15].g > 0) {
    fadeAll();
    delay(30);
  }
}

int matrix_row = NUM_ROWS;
int matrix_col = random(LEDS_PER_ROW);

void matrix() {

  for (int i = 0; i < NUM_LEDS; i++) {
    leds[i].nscale8(240);
  }

  if (matrix_row <= 0) {
    matrix_row = NUM_ROWS;
    matrix_col = random(LEDS_PER_ROW);
    hue += 42;
  }

  if (millis() - last_twinkle > 100) {
    last_twinkle = millis();
    matrix_row--;
    int pixel = ((LEDS_PER_ROW) * (matrix_row) ) + matrix_col;

    if (matrix_row % 2) {
      pixel  = ((LEDS_PER_ROW) * (matrix_row) ) + (LEDS_PER_ROW - 1 - matrix_col);
      //pixel += 1;
    }
    leds[NUM_LEDS - pixel - 1] = CHSV(hue, 255, 255);

    FastLED.show();

  }


}



void serialEvent() {
  while (Serial.available()) {
    val = Serial.parseInt();
    if(val > 0){
      val--;
      Serial.print("Val: ");
      Serial.println(val);
      FastLED.clear();
      for (int i = 0; i < val; i++) {
        hue = map(i, 0, NUM_ROWS, 0, 160);
        light_row(i, CHSV(hue, 255, 255));
  
      }
      FastLED.show();
  
    }
    

    last_msg = millis();
  }
}


void setup() {

  Serial.begin(115200);
  Serial.println("ON");

  //FastLED.addLeds<NEOPIXEL, DATA_PIN>(leds, NUM_LEDS);
  FastLED.addLeds<WS2812, DATA_PIN, RGB>(leds, 0, NUM_LEDS);

  for (int i = 0; i < NUM_ROWS; i++) {
    hue = map(i, 0, NUM_ROWS, 0, 160);
    light_row(i, CHSV(hue, 255, 255));

  }
  FastLED.show();

  waitFade();
  last_msg = millis();

}

void twinkle() {
  fadeAll();
  if (millis() - last_twinkle > 2000) {
    hue += 30;
    leds[random(NUM_LEDS)] = CHSV(hue, 255, 255);
    last_twinkle = millis();

  }
  FastLED.show();

}

unsigned long row_lit = 0;
int cur_row = 0;

void step_rows() {
  if (millis() - row_lit > 10000) {
    hue = map(cur_row, 0, NUM_ROWS, 0, 160);
    light_row(cur_row, CHSV(hue, 255, 255));
    cur_row++;
    row_lit = millis();
    FastLED.show();
    if (cur_row >= NUM_ROWS) {
      waitFade();
      cur_row = 0;
    }
  }
}

unsigned long swap = 0;
bool make_twinkle = true;
void loop() {

  if(millis() - last_msg > 10000){
    twinkle();
  }
  delay(30);


}
