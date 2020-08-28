import p5 from "p5";
import React, { useEffect, useMemo, useRef } from "react";

import * as colors from "./colors";

/**
 * A Heart object will beat, and generate voltage values according to the time
 * the beat started
 *
 * "Duration" values are really pixels. 1 pixel represents 1/60 of a second.
 */
class Heart {
  /**
   * Creates an instance of Heart
   * @param {number} adDuration Duration in pixels of the atria depolarization
   * @param {number} vdDuration Duration in pixels of the ventricle depolarization
   * @param {number} vrDuration Duration in pixels of the ventricle repolarization
   *
   * @property {number} this.beatDuration Duration in pixels of the whole beat
   * @property {number} this.nextBeat Time between last beat, and next beat
   * @property {number} this.nextBeatIn Time remaining for next beat
   * @property {number[]} this.bpm Time between two particular beats
   * @property {number} this.voltage Current voltage value. No units used.
   */
  constructor(p, ecg, options, adDuration, vdDuration, vrDuration) {
    this.p = p;
    this.ecg = ecg;
    this.options = options;
    this.adDuration = adDuration;
    this.vdDuration = vdDuration;
    this.vrDuration = vrDuration;

    this.beatDuration = adDuration + vdDuration + vrDuration;

    this.nextBeat = 1;
    this.nextBeatIn = 1;
    this.bpm = [];
    this.voltage = 0;
  }

  /**
   * Assign the heart a new voltage value, and report that value to the ECG
   * the heart is connected to.
   * @param {number} voltage
   */
  setVoltage(voltage) {
    this.voltage = voltage;
    this.ecg.addValue({ y: this.voltage });
  }

  /**
   * Generates the voltage values corresponding to the atria depolarization process.
   * This is the process that generates the first part of the curve of every beat.
   *
   * @param {number} time Time in pixels since the atria depolarization process started
   */
  atriaDepolarization(time) {
    const p = this.p;
    
    // This process is not close to what reality does, but here it is generated using a
    // sin function where only the positive values remain, making a bump followed by a
    // flat section
    let y = p.randomGaussian(5, 1) * p.sin(time * (360 / this.adDuration));

    // To compensate for the y-axis inverted direction, return -y when y is over 0
    y = y > 0 ? -y : 0.2 * (1 - y);

    // Update the voltage to whatever value was calculated
    this.setVoltage(y + p.noise(time));
  }

  /**
   * Generates the voltage values corresponding to the ventricle depolarization process.
   * This is the process that generates the spiky part of the curve of every beat.
   *
   * @param {number} time Time in pixels since the ventricle depolarization process started
   */
  ventricleDepolarization(time) {
    const p = this.p;
    
    let y;
    // In the first third, the curve has a spike going down
    if(time <= this.vdDuration / 3)
      y = (p.randomGaussian(8, 2) * (this.vdDuration - time)) / 6;
    // In the second third, the curve has a big spike going up
    else if(time < (2 * this.vdDuration) / 3) {
      // Start producing a sound, going from 0 to 0.5 volume in 0.01 seconds
      // osc.amp(0.5, 0.01);
      y = (p.randomGaussian(70, 2) * p.abs(1.5 - (this.vdDuration - time))) / 3;
      y = -y;
    }

    // In the last third, the curve has another spike (bigger than the first one) going down
    else {
      y = (p.randomGaussian(20, 2) * (this.vdDuration - time)) / 3;
      // Stop the sound, going from 0.5 to 0 volume in 0.01 secs
      // osc.amp(0, 0.01);
    }

    // Update the voltage to whatever value was calculated
    this.setVoltage(y);
  }

  /**
   * Generates the voltage values corresponding to the ventricle repolarization process.
   * This is the process that generates the last part of the curve of every beat.
   *
   * @param {number} time Time in pixels since the ventricle repolarization process started
   */
  ventricleRepolarization(time) {
    const p = this.p;
    
    // This process is not close to what reality does, but here it is generated using a
    // sin function where only the positive values remain, but displaced half a turn to
    // make a flat section followed by a bump
    let y = p.randomGaussian(8, 2) * p.sin(180 + time * (360 / this.vrDuration));

    // To compensate for the y-axis inverted direction, return -y when y is over 0
    y = y < 0 ? 0.2 * (1 - y) : -y;

    // Update the voltage to whatever value was calculated
    this.setVoltage(y + p.noise(time));
  }

  updateBPM() {
    const p = this.p;
    
    // bpm = 3600 / pixel-distance
    // this.bpm = 3600 / this.nextBeat;
    this.bpm.push(3600 / this.nextBeat);

    // To make rapid frequency changes meaningful, get the average bpm using only the
    // last 5 values of time, not all of them. So dispose the oldest one when the list
    // length is over 5.
    if(this.bpm.length > 5) this.bpm.splice(0, 1);
    this.ecg.drawBPM(p.round(this.bpm.reduce((p, c) => p + c, 0) / this.bpm.length));
    // this.ecg.drawBPM(p.round(this.bpm));
  }
  /**
   * Decrease this.nextBeatIn to simulate the pass of time.
   * If necessary, create a new this.nextBeat value
   */
  updateTimeToNextBeat() {
    if(this.options.bpm > 0 && Number.isFinite(this.nextBeatIn) === false)
      this.nextBeatIn = 0;
    
    // This indicates that the next beat will begin in the next iteration
    if(this.nextBeatIn-- <= 0) {
      // const p = this.p;
    
      // Then calculate a new "remaining time" for the next beat.
      // Use the x coordinates of the mouse position to modify the heart frequency
      // this.nextBeat = p.abs(p.ceil(p.randomGaussian((900 - p.mouseX) / 10, 3)));
      // this.nextBeat = this.nextBeatIn + 3600 / 200;
      this.nextBeat = this.nextBeatIn + 3600 / this.options.bpm;

      // It the pixel time between beat and beat is less than 18, force it to be
      // 18. This value makes to a bpm of 200.
      // if(this.nextBeat < 18) this.nextBeat = 18;

      // Get new bpm values using the last this.nextBeat
      this.updateBPM();

      // Reset the remaining time to the new calculated time
      this.nextBeatIn = this.nextBeat;
    }
  }

  /**
   * Get voltage values for every second of the beat, even at rest (no-beating time
   * after the ventricle repolarization finished, and before the next atria depolarization)
   * @param {*} time Time in pixels after the atria depolarization started
   */
  beat(time) {
    // Update the time left for the start of the next beat
    this.updateTimeToNextBeat();

    // If according to time, beat is in the atria depolarization process, call that function
    if(time <= this.adDuration) {
      this.atriaDepolarization(time);
      return;
    }

    // If according to time, beat is in the ventricle depolarization process, call that function
    // Update the time so the value sent is relative to the start of the ventricle
    // depolarization process
    time -= this.adDuration;
    if(time <= this.vdDuration) {
      this.ventricleDepolarization(time);
      return;
    }

    // If according to time, beat is in the ventricle repolarization process, call that function
    // Update the time so the value sent is relative to the start of the ventricle
    // repolarization process
    time -= this.vdDuration;
    if(time <= this.vrDuration) {
      this.ventricleRepolarization(time);
      return;
    }

    const p = this.p;
    
    // If function reached this point, it's not in any of the beat processes, and it's resting.
    // Add a noisy voltage value
    this.setVoltage(0 + p.noise(p.draw_i * 0.5) * 5);
  }
}

/**
 *  ECG will receive, process, and draw the health information
 */
class ECG {
  /**
   * @param {Object} graphZero  Coordinates of the {0, 0} value of the graph
   * @param {Object[]} values   Array of {x, y} objects. x plots time, y plots voltage
   * @param {number} maxValuesHistory   Maximum number of values before wiping oldest one
   */
  constructor(p, color, graphZero, values, maxValuesHistory) {
    this.p = p;
    this.color = color;
    this.graphZero = graphZero;
    this.values = values;
    this.maxValuesHistory = maxValuesHistory;
    this.maximumX = maxValuesHistory;
  }

  /**
   * Add a new voltage value to the values array. If it exceeds the maximum number of
   * values allowed to store, remove the oldest one before.
   * @param {Object} value {x, y} object. x represents time, y represents voltage
   */
  addValue(value) {
    // If no x (time) value is received, assume it is the sucessor of the last value
    // in the values array. If the new x exceeds the maximum allowed, make x = 0
    if(this.values.length >= this.maxValuesHistory) this.values.splice(0, 1);
    if(value.x === undefined) {
      value.x = (this.values[this.values.length - 1].x + 1) % this.maximumX;
    }
    this.values.push(value);
  }

  /**
   * Draw lines joining every voltage value throughout time in the screen
   */
  plotValues() {
    const p = this.p;
    
    p.push();

    const c = this.color;

    for(let i = 1; i < this.values.length; i++) {
      // If the previous value has a X coordinate higher than the current one,
      // don't draw it, to avoid lines crossing from end to start of the ECG plot area.
      if(this.values[i - 1].x > this.values[i].x) continue;

      // Older values are drawn with a lower alpha
      let alpha = i / this.values.length;

      // Set the color of the drawing
      p.stroke(c, alpha);
      p.fill(c, alpha);

      // Line from previous value to current value
      p.line(
        this.graphZero.x + this.values[i - 1].x,
        this.graphZero.y + this.values[i - 1].y,
        this.graphZero.x + this.values[i].x,
        this.graphZero.y + this.values[i].y
      );

      // For the last 5 values, draw a circle with a radius going in function to
      // its index. This to make the leading line thicker
      if(i + 5 > this.values.length) {
        p.circle(
          this.graphZero.x + this.values[i].x,
          this.graphZero.y + this.values[i].y,
          this.values.length / i * 4
        );
      }
    }

    const v = this.values[this.values.length - 1];

    // Set the color of the drawing
    p.stroke(c);

    // Vertical line
    p.line(
      this.graphZero.x + v.x,
      0,
      this.graphZero.x + v.x,
      124
    );

    p.pop();
  }

  //// The following methods update the values represented as html elements

  updateInfo() {
    const p = this.p;
    
    this.updateDate();
    if(p.draw_i % 50 === 0) {
      this.updateBloodPressure();
      this.updateVentilation();
      this.updateTemperature();
      this.updateHemoglobin();
    }
  }

  updateHemoglobin() {
    const p = this.p;
    
    // document.getElementById("hemoglobin-value").innerHTML = p.randomGaussian(14, .1).toFixed(1)

  }
  updateTemperature() {
    const p = this.p;
    
    // document.getElementById("temperature-value").innerHTML = p.randomGaussian(98.6, .1).toFixed(1)

  }
  updateVentilation() {
    const p = this.p;
    
    // document.getElementById("minute-ventilation-value").innerHTML = p.randomGaussian(6, .5).toFixed(2)
  }

  updateBloodPressure() {
    const p = this.p;
    
    // document.getElementById("pressure-value").innerHTML = "" + p.round(p.randomGaussian(130, 1)) + "/" + p.round(p.randomGaussian(90, 1));
  }

  updateDate() {
    let date = new Date;
    // document.getElementById("date-value").innerHTML = formatDate(date);
  }

  /**
   * Update the html content of the span containing the bpm info
   * @param {number} bpm
   */
  drawBPM(bpm) {
    // document.getElementById("heart-rate-value").innerHTML = bpm;
  }
}

const sketch = (options) => (p) => {
  // Taken from https://codepen.io/davidomarf/pen/ydyzaa
  // Keep track of the times draw() has been called
  p.draw_i = 0;

  // p5.sound variables
  // let osc;

  const W = 286;
  const H = 124;

  // Initialize the ecg
  // let ecg = new ECG(p, { x: 0, y: 110 }, [{ x: 0, y: 0 }], 600);
  let ecg = new ECG(p, p.color(options.color), { x: 0, y: 100 }, [{ x: 0, y: 0 }], W);

  // Initialize a heart
  let heart = new Heart(p, ecg, options, 12, 8, 12);

  p.setup = () => {
    p.createCanvas(W, H, p.WEBGL);
    // p.frameRate(12);

    // Set the color mode to allow calling RGBA without converting to string
    p.colorMode(p.RGB, 255, 255, 255, 1);

    // Work with degrees instead of Radians (sin function used inside Heart Class)
    p.angleMode(p.DEGREES);

    // Set the frequency the ecg will emit every heartbeat.
    // osc = new p5.Oscillator();
    // osc.setType("sine");
    // osc.freq(445);
    // osc.amp(0);
    // osc.start();
  };
  p.draw = () => {
    p.translate(-W * .5, -H * .5);

    // Keep track of the number of times draw has been called
    ++p.draw_i;

    // Hide previous ECG line by drawing a background
    /**
     *  Draw a rectangle of size (canvas.width - 1, canvas.height - 1)  with dark background
     * and a brilliant green border.
     *
     * The -1 is to allow the border to be seen in the final page.
     */
    p.push();
    p.noStroke();
    p.fill(colors.array[0]);
    // p.stroke(121, 239, 150, 1);
    // p.rect(0, 0, W - 1, H - 1);
    p.rect(0, 0, W, H);
    p.pop();

    // Get the new voltage values for the ECG from the heart
    heart.beat(heart.nextBeat - heart.nextBeatIn);

    // Draw the line of voltage values over time in the ECG screen
    ecg.plotValues();

    // Update the information values of the ECG
    ecg.updateInfo();
  };
};

export default ({ bpm }) => {
  const ref = useRef(null);
  const options = useMemo(() => ({}), []);
  options.bpm = bpm;
  options.color = colors.array[6];

  useEffect(() => {
    if(ref.current === null)
      return;

    const p = new p5(sketch(options), ref.current);

    return p.remove;
  }, [ ref.current ]);

  return (
    <div ref={ref} />
  );
};
