# AI Visualization Benchmark System

This system allows you to benchmark different AI models on their ability to create and fix data visualizations.

## Getting Started

1. **Setup environment**
   
   Create a `.env` file in the root directory with your OpenRouter API key:
   ```
   OPENROUTER_API_KEY=your_api_key_here
   ```

2. **Install dependencies**
   
   ```bash
   npm install
   ```

3. **Build the project**
   
   ```bash
   npm run build
   ```

## Running Benchmarks

Run benchmarks for all challenges with default models:

```bash
npm run benchmark
```

Run a specific challenge:

```bash
npm run benchmark -- --challenge stockPriceChart
```

Specify which models to test:

```bash
npm run benchmark -- --models gpt-4,claude-3
```

Enable caching to speed up development and testing:

```bash
npm run benchmark -- --cache
```

## Grading Results

Launch the grading UI to review and score model outputs:

```bash
npm run grade
```

Filter by a specific challenge:

```bash
npm run grade -- --challenge stockPriceChart
```

## Creating New Challenges

1. Create a new directory in `benchmarks/challenges/` with your challenge name
2. Create the following files:
   - `prompt.md`: The instructions for the AI model
   - `test.js`: Script to verify the model's solution works correctly
   - Initial code files with TODOs for the model to complete

Example directory structure:
```
benchmarks/challenges/yourChallenge/
├── prompt.md
├── test.js
├── index.html
└── script.js
```

### Visualization Challenge Template

For D3.js visualization challenges, you can use this template structure:

1. `index.html`: Basic HTML template that loads D3 and your script
2. `script.js`: JavaScript with TODOs for the AI to implement the visualization
3. `data.json`: Sample dataset for the visualization
4. `test.js`: Test script that loads the visualization and checks for key elements

## How Grading Works

The grading system uses two components:

1. **Automated tests**: Each challenge includes tests that verify functional correctness
2. **Human grading**: The grading UI allows humans to review and score:
   - Functionality (0-5 scale)
   - Aesthetics (0-5 scale)
   - Notes and feedback

Grades are saved back to the `benchmarks/results.csv` file for analysis.

## Visualization Output

For visualization challenges, the system captures screenshots which are saved to:
```
benchmarks/visualizations/{challenge}/{model}/output.png
```

These images are displayed in the grading UI for visual comparison.

## Troubleshooting

- **API Key Issues**: Ensure your OpenRouter API key is correctly set in `.env`
- **Test Failures**: Check the output logs for specific error messages
- **Visualization Rendering**: Adjust timeouts in test scripts if visualizations are complex

## Future Enhancements

- Multi-user grading support
- Enhanced grading UI with side-by-side comparisons
- Statistics dashboard
- Support for more model providers 