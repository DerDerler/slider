# Status Slider

A simple slider to track a value

## Code

```slider
title: Progress Tracker
value: 50
labelLeft: Start
labelRight: Complete
color: #000000
color: #999999
color: #FFFFFF
```
All the parameters are optional, but **value** needs to exist so the status of the slider is saved when the note is refreshed

- title: The Text on top of the slider 
- value: the current value of the slider
- labelLeft: The Text on the left end of the slider
- labelRight: The Text on the right end of the slider
- colors: You can enter up to 3 Colors with Hexcode
  - 1 color: the bar is one solid color
  - 2 colors: a gradiant from right to left
  - 3 colors: a color in the middle is added to the gradiant
