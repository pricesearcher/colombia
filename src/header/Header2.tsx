
import "./l-header.scss";
import React from "react";

interface Props {}

interface State {
  rand: number;
}

// Top level app component
export default class Header2 extends React.Component<Props, State> {

  constructor(props) {
    super(props);
    this.state = {
      rand: Math.ceil(Math.random() * 1000) + 1000,
    }
  }


  public render(): JSX.Element {
    return (
      <div className="l-header">
        Header 2, Random number: {this.state.rand}
      </div>
    );
  }

}
