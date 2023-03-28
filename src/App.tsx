import './App.css';
import './bootstrap.min.css';
import React from 'react';

const keys = [['CLR', 'DEL', '+', '-'], ['1', '2', '3', '*'], ['4', '5', '6', '/'], ['7', '8', '9', '='], ['0', '.', 'PI', 'ANS']];
const keysIntegers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
const keysOperations = ['+', '-', '*', '/'];

const ids = {
  '0': 'zero', '1': 'one', '2': 'two', '3': 'three', '4': 'four', '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine', '=': 'equals',
  '+': 'add', '-': 'subtract', '/': 'divide', '*': 'multiply', '.': 'decimal', 'CLR': 'clear', 'DEL': 'delete', 'ANS': 'ans', 'PI': 'pi'
};

const codeToPad = {
  96: 'zero', 97: 'one', 98: 'two', 99: 'three', 100: 'four', 101: 'five', 102: 'six', 103: 'seven', 104: 'eight', 105: 'nine', 110: 'decimal',
  13: 'equals', 111: 'divide', 106: 'multiply', 109: 'subtract', 107: 'add', 46: 'delete', 8: 'clear', 45: 'ans'
};

type DisplayProps = {
    formula: string,
    display: string,
    output: string
}

class Display extends React.Component<DisplayProps> {
  render() {
    return (<div id="screen" className="d-flex flex-column justify-content-evenly align-items-end">
      <div id="answer" className="d-flex justify-content-start" >Out: {parseFloat(parseFloat(this.props.output).toFixed(4))}</div>
      <div className="formula-screen d-flex justify-content-end">{this.props.formula}</div>
      <div id="display" className="output-screen d-flex justify-content-end">{['+', '-', '*', '/'].includes(this.props.display) ? this.props.display : parseFloat(parseFloat(this.props.display).toFixed(4))}</div>
    </div>);
  }
}

type MapStrStr = {
  [key: string]: string;
}

type KeyPadProps  = typeof KeyPad.defaultProps & {
    inputProcessing: (event: any) => any
}

class KeyPad extends React.Component<KeyPadProps> {
  static defaultProps = { keys: keys as string[][],  ids: ids as MapStrStr};

  render() {
    const keysArray = this.props.keys.map((row) => (row.map((input, idx) => (<button className="col d-flex justify-content-center align-items-center" id={this.props.ids[input]} value={input} key={"pad-" + idx} onClick={this.props.inputProcessing}>{input}</button>))));

    return (<div className="container" id="keyPad">
      {keysArray.map((input, idx) => (<div className="row row-cols-4" key={"row-" + idx}>{input}</div>))}
    </div>);
  }
}

type MapIntStr = {
  [key: number]: string;
}

type CalculatorProps =  typeof Calculator.defaultProps;

type CalculatorStates = {
  formula: string,
  display: string,
  output: string,
  previousKey: string
}

type MouseEventType = React.MouseEvent;

class Calculator extends React.Component<CalculatorProps, CalculatorStates> {
  static defaultProps = { keysIntegers: keysIntegers as string[], keysOperations: keysOperations as string[], codeToPad: codeToPad as MapIntStr};

  private clickEvent: MouseEvent;

  constructor(props: CalculatorProps) {
    super(props);
    this.state = { formula: '', display: '0', output: '0', previousKey: '' };
    this.inputProcessing = this.inputProcessing.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);

    this.clickEvent = new MouseEvent("click", {
      "view": window,
      "bubbles": true,
      "cancelable": false
    });
  }

  componentDidMount() {
    document.addEventListener("keydown", this.handleKeyPress);

  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyPress);
  };

  handleKeyPress(event: any) {
    if ([96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 110, 13, 111, 106, 109, 107, 46, 8, 45].includes(event.keyCode)) {
      const elem = document.getElementById(this.props.codeToPad[event.keyCode]);
      elem?.dispatchEvent(this.clickEvent);
    }
  }

  inputProcessing(event: any) {

    const currentKey = event.target.value;

    if (this.props.keysIntegers.includes(currentKey) || currentKey === 'PI') {
      if (this.state.previousKey === '=') {
        this.setState((state) => ({ formula: (currentKey === 'PI') ? '3.1416' : currentKey, display: (currentKey === 'PI') ? '3.1416' : currentKey, previousKey: currentKey }));
      } else {
        const l = this.state.formula.length - 1;
        if (!(this.state.formula[l] === '0') || !(currentKey === '0')) {
          this.setState((state) => ({ formula: state.formula + ((currentKey === 'PI') ? '3.1416' : currentKey), display: ((state.display === '0' || this.props.keysOperations.includes(this.state.previousKey)) ? '' : state.display) + ((currentKey === 'PI') ? '3.1416' : currentKey), previousKey: currentKey }));
        }
      }
    } else if (this.props.keysOperations.includes(currentKey)) {
      const l = this.state.formula.length - 1;
      if (this.state.previousKey === '=') {
        this.setState((state) => ({ formula: state.output + currentKey, display: currentKey, previousKey: currentKey }));
      }
      else if (this.props.keysIntegers.includes(this.state.previousKey) || this.props.keysIntegers.includes(this.state.formula[l]) || this.state.previousKey === 'ANS') {
        this.setState((state) => ({ formula: state.formula + currentKey, display: currentKey, previousKey: currentKey }));
      } else if (this.props.keysOperations.includes(this.state.previousKey) || this.props.keysOperations.includes(this.state.formula[l])) {
        if (currentKey === '-') {
          this.setState((state) => ({ formula: state.formula + currentKey, display: currentKey, previousKey: currentKey }));
        } else {
          this.setState((state) => {
            const lastElem = state.formula.split('').reverse().find((input, idx) => '1234567890.'.includes(input)) as string;
            const lastIdx = state.formula.lastIndexOf(lastElem);
            return { formula: state.formula.slice(0, lastIdx + 1) + currentKey, display: currentKey, previousKey: currentKey };
          });
        }
      } else if (this.state.formula[this.state.formula.length - 1] === '.') {
        this.setState((state) => ({ formula: state.formula.slice(0, -1) + currentKey, display: state.display.slice(0, -1), previousKey: currentKey }));
      }
    } else if (currentKey === '.') {

      if (this.state.previousKey !== '=') {
        if (!this.state.display.includes('.')) {
          if (this.props.keysOperations.includes(this.state.previousKey) || this.state.formula === '') {
            this.setState((state) => ({ formula: state.formula + '0' + currentKey, display: '0' + currentKey, previousKey: currentKey }));
          } else {
            this.setState((state) => ({ formula: state.formula + currentKey, display: state.display + currentKey, previousKey: currentKey }))
          }
        }
      }
      else {
        this.setState((state) => ({ formula: '0' + currentKey, display: '0' + currentKey, previousKey: currentKey }));
      }
    }
    else if (currentKey === '=') {
      if (this.state.previousKey !== "=") {
        if (this.state.formula !== '') {
          this.setState((state) => {
            let result;
            try {
              result = Function('return ' + state.formula)();

            }
            catch { result = 'NaN' };
            return { formula: state.formula + '=' + parseFloat(result.toFixed(4)), display: result, output: result, previousKey: '=' }
          });
        }
      }
    } else if (currentKey === 'CLR') {
      this.setState({ formula: '', output: '0', display: '0' });
    } else if (currentKey === 'DEL') {
      if (this.state.previousKey === '=') {
        this.setState((state) => ({ formula: state.formula.slice(0, state.formula.indexOf('=') - 1), previousKey: 'DEL' }));
      } else {
        this.setState((state) => ({ formula: state.formula.slice(0, -1), previousKey: 'DEL' }));
      }
    } else if (currentKey === 'ANS') {
      if (this.state.output !== "") {
        if (this.props.keysOperations.includes(this.state.previousKey)) {
          this.setState((state) => ({ formula: state.formula + parseFloat(parseFloat(state.output).toFixed(4)), previousKey: 'ANS' }));
        } else {
          this.setState((state) => ({ formula: '' + parseFloat(parseFloat(state.output).toFixed(4)), previousKey: 'ANS' }));
        }
      }

    }
  }

  render() {
    return (<div id="calculator" className="d-flex flex-column align-items-center justify-content-center">
      <Display formula={this.state.formula} display={this.state.display} output={this.state.output} />
      <KeyPad inputProcessing={this.inputProcessing} />
    </div>);
  }
}


function App() {
  return (
    <div className="App">
      <Calculator />
    </div>
  );
}

export default App;