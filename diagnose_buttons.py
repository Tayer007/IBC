#!/usr/bin/env python3
"""
Button Diagnostic Script
Helps identify if GPIO 23 and 24 buttons are wired correctly
"""

import RPi.GPIO as GPIO
import time

GPIO.setmode(GPIO.BCM)
GPIO.setwarnings(False)

GPIO.setup(23, GPIO.IN, pull_up_down=GPIO.PUD_DOWN)
GPIO.setup(24, GPIO.IN, pull_up_down=GPIO.PUD_DOWN)

print("="*80)
print(" BUTTON DIAGNOSTIC TOOL".center(80))
print("="*80)
print()
print("This tool will help identify if your buttons are wired correctly.")
print()
print("EXPECTED WIRING:")
print("  Button 1 (FULL sensor)  → GPIO 23 (Physical Pin 16) → Stops INLET PUMP")
print("  Button 2 (EMPTY sensor) → GPIO 24 (Physical Pin 18) → Stops DRAIN VALVE")
print()
print("="*80)
print()

input("Press ENTER when ready to start testing...")
print()

# Test 1: Identify Button 1
print("TEST 1: Identifying first button (should be FULL sensor)")
print("-" * 80)
print("Please press and HOLD the button that should stop the INLET PUMP (FULL sensor)")
print("Waiting for button press...")

timeout = time.time() + 10
button1_gpio = None

while time.time() < timeout:
    if GPIO.input(23):
        button1_gpio = 23
        print("✓ Button detected on GPIO 23 (CORRECT!)")
        break
    if GPIO.input(24):
        button1_gpio = 24
        print("⚠️  Button detected on GPIO 24 (WRONG - wires are swapped!)")
        break
    time.sleep(0.1)

if button1_gpio is None:
    print("✗ No button detected - check wiring!")
else:
    print(f"Waiting for button release...")
    while GPIO.input(button1_gpio):
        time.sleep(0.1)
    print("Button released\n")

time.sleep(1)

# Test 2: Identify Button 2
print("TEST 2: Identifying second button (should be EMPTY sensor)")
print("-" * 80)
print("Please press and HOLD the button that should stop the DRAIN VALVE (EMPTY sensor)")
print("Waiting for button press...")

timeout = time.time() + 10
button2_gpio = None

while time.time() < timeout:
    if GPIO.input(23):
        button2_gpio = 23
        print("⚠️  Button detected on GPIO 23 (WRONG - wires are swapped!)")
        break
    if GPIO.input(24):
        button2_gpio = 24
        print("✓ Button detected on GPIO 24 (CORRECT!)")
        break
    time.sleep(0.1)

if button2_gpio is None:
    print("✗ No button detected - check wiring!")
else:
    print(f"Waiting for button release...")
    while GPIO.input(button2_gpio):
        time.sleep(0.1)
    print("Button released\n")

# Summary
print()
print("="*80)
print(" DIAGNOSTIC RESULTS".center(80))
print("="*80)
print()

if button1_gpio == 23 and button2_gpio == 24:
    print("✓ SUCCESS: Buttons are wired correctly!")
    print()
    print("  Button on GPIO 23 (Pin 16) → FULL sensor → Stops INLET PUMP")
    print("  Button on GPIO 24 (Pin 18) → EMPTY sensor → Stops DRAIN VALVE")
    print()
    print("The system should work correctly now.")

elif button1_gpio == 24 and button2_gpio == 23:
    print("⚠️  WARNING: Buttons are SWAPPED!")
    print()
    print("  Current wiring:")
    print("    GPIO 23 (Pin 16) → Connected to EMPTY sensor button (WRONG)")
    print("    GPIO 24 (Pin 18) → Connected to FULL sensor button (WRONG)")
    print()
    print("  This means:")
    print("    - Pressing FULL button stops DRAIN VALVE (wrong)")
    print("    - Pressing EMPTY button stops INLET PUMP (wrong)")
    print()
    print("  SOLUTION: Swap the wires for GPIO 23 and GPIO 24 at the Raspberry Pi")

elif button1_gpio is None or button2_gpio is None:
    print("✗ ERROR: One or both buttons not detected")
    print()
    print(f"  Button 1 (FULL sensor):  {'Detected on GPIO ' + str(button1_gpio) if button1_gpio else 'NOT DETECTED'}")
    print(f"  Button 2 (EMPTY sensor): {'Detected on GPIO ' + str(button2_gpio) if button2_gpio else 'NOT DETECTED'}")
    print()
    print("  Check:")
    print("    - Wiring connections")
    print("    - Button functionality")
    print("    - Pull-down resistors (10kΩ to GND)")

else:
    print("⚠️  UNEXPECTED RESULT")
    print()
    print(f"  Button 1 detected on: GPIO {button1_gpio}")
    print(f"  Button 2 detected on: GPIO {button2_gpio}")
    print()
    print("  Both buttons might be triggering the same GPIO")

print()
print("="*80)

GPIO.cleanup()
