// app.js
"use strict";

// Import du fichier CSS
import './css/stylecete.css';

// Import du fichier slider.js
import { initializeSlider } from './slider.js';

window.Webflow ||= [];
window.Webflow.push(() => {
    alert("hello world");
    // Appeler la fonction initializeSlider depuis slider.js
    initializeSlider();
});