# ILOG Systèmes de Construction - Logo Documentation

## Overview

This document explains the implementation of the ILOG Systèmes de Construction animated logo in the Housy application.

## Logo Description

The ILOG logo is a dynamic animated element that consists of several geometric lines animating in a synchronous pattern. The animation creates a distinctive and modern representation of the ILOG brand identity with the following characteristics:

- Geometric animation with blue lines (color code: #053146)
- Four synchronized animation segments
- Minimal, modern aesthetic that conveys precision and technical expertise
- Animation cycle of 3.2 seconds that repeats infinitely

## Technical Implementation

The logo is implemented as a React component (`CompanyLogo.tsx`) with accompanying CSS animations (`loader.css`). The implementation uses pure CSS animations without requiring any JavaScript libraries for the animation effects.

### Structure

The logo consists of:

1. A parent container with positioning attributes
2. Four divs representing different parts of the animation
3. Inner spans that animate using keyframe animations
4. CSS transitions to control the animation timing and easing

### Animation Details

The animation timings are carefully synchronized to create a cohesive motion:

- Each animation segment runs on a 3.2-second cycle
- Different segments are delayed by small intervals (0.4s, 0.8s, etc.)
- The animations use easing functions for smooth start and end transitions
- All animation elements use the ILOG brand color (#053146)

## Usage Guidelines

When implementing the ILOG logo in different parts of the application:

1. Import the CompanyLogo component from the UI components directory
2. Use it in headers, loading screens, or branding areas
3. Ensure sufficient surrounding space to display the animation properly
4. Maintain the original aspect ratio to preserve visual integrity
5. For smaller displays, consider using only the animation without accompanying text

## Brand Guidelines

The ILOG brand identity represents:

- Technical precision and engineering excellence
- Modern construction methodologies
- Tunisian construction industry expertise
- Innovation in building systems and materials

The animated logo should always be displayed with its proper colors and proportions to maintain brand consistency throughout the application.

## Origin

The original animation was adapted from a design by RafaM-dev on Uiverse.io, customized for ILOG's specific branding requirements.
