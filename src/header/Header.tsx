
import "./l-header.scss";
import * as React from "react";
import * as ReactDOM from "react-dom";

interface Props {}

interface State {
  rand: number;
}

// Top level app component
class Header extends React.Component<Props, State> {

  constructor(props) {
    super(props);
    this.state = {
      rand: Math.ceil(Math.random() * 1000),
    }
  }


  public render(): JSX.Element {
    return (
      <div>
        Random number: {this.state.rand}
      </div>
    );
  }

}

// prevent hydration if page is being rendered "off-location"
ReactDOM.render(<Header />, document.querySelector("#app-header"));
