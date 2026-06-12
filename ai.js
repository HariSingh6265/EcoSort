// Machine learning and image classification module using ml5.js MobileNet

import { KEYWORD_MAP } from './data.js';

let classifierInstance = null;

// Initialize the ml5 image classifier
export function initClassifier() {
    return new Promise((resolve, reject) => {
        if (classifierInstance) {
            resolve(classifierInstance);
            return;
        }

        if (typeof ml5 === 'undefined') {
            reject(new Error("ml5.js library is not loaded. Verify your internet connection."));
            return;
        }

        try {
            // ml5.imageClassifier returns a promise when no callback is provided in version 0.12.x
            ml5.imageClassifier('MobileNet')
                .then((model) => {
                    classifierInstance = model;
                    resolve(model);
                })
                .catch((err) => {
                    reject(err);
                });
        } catch (error) {
            reject(error);
        }
    });
}

// Classify the input element (image, video, or canvas)
export async function classifyImage(element) {
    const model = await initClassifier();
    return new Promise((resolve, reject) => {
        model.classify(element, (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
}

// Check if label terms map to a waste category key
function matchLabelToCategory(label) {
    const terms = label.toLowerCase().split(',').map(term => term.trim());
    
    // 1. Check for exact match in terms
    for (const term of terms) {
        if (KEYWORD_MAP[term]) {
            return KEYWORD_MAP[term];
        }
    }

    // 2. Check for partial substring match (contains key or vice-versa)
    for (const term of terms) {
        for (const key in KEYWORD_MAP) {
            if (term.includes(key) || key.includes(term)) {
                return KEYWORD_MAP[key];
            }
        }
    }

    return null;
}

// Process predictions list and map to a waste category
export function processClassificationResults(predictions) {
    if (!predictions || predictions.length === 0) {
        return {
            categoryKey: 'dry',
            matchedLabel: 'unidentified object',
            confidence: 0,
            isFallback: true
        };
    }

    // Iterate through predictions (typically sorted by confidence descending)
    for (const pred of predictions) {
        const categoryKey = matchLabelToCategory(pred.label);
        if (categoryKey) {
            return {
                categoryKey,
                matchedLabel: pred.label.split(',')[0], // primary term
                confidence: Math.round(pred.confidence * 100),
                isFallback: false
            };
        }
    }

    // No direct keyword matches found: default to 'dry' with first prediction label
    return {
        categoryKey: 'dry',
        matchedLabel: predictions[0].label.split(',')[0],
        confidence: Math.round(predictions[0].confidence * 100),
        isFallback: true
    };
}
