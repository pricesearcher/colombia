
import "./l-header.scss";
import React from "react";

interface Props {}

interface State {
  rand: number;
}

export default class Header extends React.Component<Props, State> {

  constructor(props) {
    super(props);
    this.state = {
      rand: Math.ceil(Math.random() * 1000),
    }
  }


  public render(): JSX.Element {
    return (
      <div className="l-header">
        Header 1, Random number: {this.state.rand}
      </div>
    );
  }

}
