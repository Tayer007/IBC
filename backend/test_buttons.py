#!/usr/bin/env python3
"""
Test script for water level sensor buttons
Press CTRL+C to exit
"""

import RPi.GPIO as GPIO
import time

# Setup
GPIO.setmode(GPIO.BCM)
GPIO.setwarnings(False)

# Configure buttons with pull-down resistors
GPIO.setup(23, GPIO.IN, pull_up_down=GPIO.PUD_DOWN)  # FULL sensor
GPIO.setup(24, GPIO.IN, pull_up_down=GPIO.PUD_DOWN)  # EMPTY sensor

print("=" * 60)
print("Water Level Button Test")
print("=" * 60)
print("\nWiring Instructions:")
print("  GPIO 23 (Pin 16) - FULL sensor button")
print("    - One side of button → GPIO 23 (Physical Pin 16)")
print("    - Other side of button → 3.3V (Physical Pin 1 or 17)")
print("\n  GPIO 24 (Pin 18) - EMPTY sensor button")
print("    - One side of button → GPIO 24 (Physical Pin 18)")
print("    - Other side of button → 3.3V (Physical Pin 1 or 17)")
print("\n" + "=" * 60)
print("\nReading button states... Press buttons to test!")
print("Press CTRL+C to exit\n")

try:
    last_full = False
    last_empty = False

    while True:
        # Read button states
        full_pressed = GPIO.input(23)
        empty_pressed = GPIO.input(24)

        # Detect changes and print
        if full_pressed != last_full:
            if full_pressed:
                print("🔴 GPIO 23 (FULL):  PRESSED  ← Tank is FULL, stop inlet pump!")
            else:
                print("🟢 GPIO 23 (FULL):  Released")
            last_full = full_pressed

        if empty_pressed != last_empty:
            if empty_pressed:
                print("🔴 GPIO 24 (EMPTY): PRESSED  ← Tank is EMPTY, stop drain valve!")
            else:
                print("🟢 GPIO 24 (EMPTY): Released")
            last_empty = empty_pressed

        time.sleep(0.1)  # Check 10 times per second

except KeyboardInterrupt:
    print("\n\nTest stopped by user")
    print(f"Final state: GPIO 23 (FULL) = {GPIO.input(23)}, GPIO 24 (EMPTY) = {GPIO.input(24)}")

finally:
    GPIO.cleanup()
    print("GPIO cleanup complete")
