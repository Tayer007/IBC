#!/usr/bin/env python3
"""
GPIO Hardware Test Script
Tests 3 LEDs and 2 buttons to verify wiring before integration
"""

import RPi.GPIO as GPIO
import time
import sys

# GPIO Pin Definitions (BCM numbering)
LED_ZULAUF = 17    # Green LED - Inlet Pump
LED_ABLAUF = 27    # Red LED - Drain Valve
LED_BELUEFTUNG = 22  # Blue LED - Aeration/Blower

BUTTON_HIGH = 23   # High water level sensor
BUTTON_LOW = 24    # Low water level sensor

def setup_gpio():
    """Initialize GPIO pins"""
    GPIO.setmode(GPIO.BCM)
    GPIO.setwarnings(False)

    # Setup LED pins as outputs
    GPIO.setup(LED_ZULAUF, GPIO.OUT)
    GPIO.setup(LED_ABLAUF, GPIO.OUT)
    GPIO.setup(LED_BELUEFTUNG, GPIO.OUT)

    # Setup button pins as inputs with pull-down resistors
    # (We have external 10K pull-down resistors, but enabling internal doesn't hurt)
    GPIO.setup(BUTTON_HIGH, GPIO.IN, pull_up_down=GPIO.PUD_DOWN)
    GPIO.setup(BUTTON_LOW, GPIO.IN, pull_up_down=GPIO.PUD_DOWN)

    # Start with all LEDs off
    GPIO.output(LED_ZULAUF, GPIO.LOW)
    GPIO.output(LED_ABLAUF, GPIO.LOW)
    GPIO.output(LED_BELUEFTUNG, GPIO.LOW)

    print("✓ GPIO initialized successfully")

def test_leds():
    """Test each LED individually"""
    print("\n" + "="*50)
    print("LED TEST - Each LED will blink 3 times")
    print("="*50)

    leds = [
        (LED_ZULAUF, "Green LED (Zulaufpumpe/Inlet Pump)", GPIO.HIGH),
        (LED_ABLAUF, "Red LED (Ablaufventil/Drain Valve)", GPIO.HIGH),
        (LED_BELUEFTUNG, "Blue LED (Belüftung/Blower)", GPIO.HIGH)
    ]

    for pin, name, _ in leds:
        print(f"\nTesting {name}...")
        for i in range(3):
            GPIO.output(pin, GPIO.HIGH)
            print(f"  Blink {i+1}/3 - ON", end="\r")
            time.sleep(0.5)
            GPIO.output(pin, GPIO.LOW)
            print(f"  Blink {i+1}/3 - OFF", end="\r")
            time.sleep(0.5)
        print(f"  ✓ {name} test complete")

    print("\n✓ All LED tests complete")

def test_all_leds_together():
    """Test all LEDs on at once"""
    print("\n" + "="*50)
    print("ALL LEDS ON TEST - All LEDs will turn on for 2 seconds")
    print("="*50)

    print("Turning all LEDs ON...")
    GPIO.output(LED_ZULAUF, GPIO.HIGH)
    GPIO.output(LED_ABLAUF, GPIO.HIGH)
    GPIO.output(LED_BELUEFTUNG, GPIO.HIGH)
    time.sleep(2)

    print("Turning all LEDs OFF...")
    GPIO.output(LED_ZULAUF, GPIO.LOW)
    GPIO.output(LED_ABLAUF, GPIO.LOW)
    GPIO.output(LED_BELUEFTUNG, GPIO.LOW)

    print("✓ All LEDs together test complete")

def test_buttons():
    """Test button inputs with real-time monitoring"""
    print("\n" + "="*50)
    print("BUTTON TEST - Press each button to test")
    print("="*50)
    print("Press CTRL+C when done testing buttons\n")

    print("Waiting for button presses...")
    print("  - Press HIGH button (GPIO 23)")
    print("  - Press LOW button (GPIO 24)\n")

    last_high_state = False
    last_low_state = False

    try:
        while True:
            # Read button states
            high_pressed = GPIO.input(BUTTON_HIGH) == GPIO.HIGH
            low_pressed = GPIO.input(BUTTON_LOW) == GPIO.HIGH

            # Detect state changes and print
            if high_pressed and not last_high_state:
                print("🟢 HIGH LEVEL BUTTON PRESSED (GPIO 23)")
                GPIO.output(LED_ZULAUF, GPIO.HIGH)  # Light up green LED when pressed
            elif not high_pressed and last_high_state:
                print("   HIGH level button released")
                GPIO.output(LED_ZULAUF, GPIO.LOW)

            if low_pressed and not last_low_state:
                print("🔴 LOW LEVEL BUTTON PRESSED (GPIO 24)")
                GPIO.output(LED_ABLAUF, GPIO.HIGH)  # Light up red LED when pressed
            elif not low_pressed and last_low_state:
                print("   LOW level button released")
                GPIO.output(LED_ABLAUF, GPIO.LOW)

            last_high_state = high_pressed
            last_low_state = low_pressed

            time.sleep(0.05)  # 50ms polling interval (debouncing)

    except KeyboardInterrupt:
        print("\n\n✓ Button test complete")

def cleanup():
    """Clean up GPIO"""
    GPIO.output(LED_ZULAUF, GPIO.LOW)
    GPIO.output(LED_ABLAUF, GPIO.LOW)
    GPIO.output(LED_BELUEFTUNG, GPIO.LOW)
    GPIO.cleanup()
    print("\n✓ GPIO cleanup complete")

def main():
    """Main test sequence"""
    print("\n" + "="*50)
    print("  IBC GPIO HARDWARE TEST")
    print("  Testing 3 LEDs + 2 Buttons")
    print("="*50)

    try:
        # Setup
        setup_gpio()

        # Run tests
        test_leds()
        test_all_leds_together()
        test_buttons()

        print("\n" + "="*50)
        print("  ALL TESTS COMPLETE!")
        print("="*50)
        print("\nHardware verification successful. Ready for integration.")

    except Exception as e:
        print(f"\n❌ Error during test: {e}")
        import traceback
        traceback.print_exc()
    finally:
        cleanup()

if __name__ == "__main__":
    main()
