
import ReactDOM from "react-dom";
import Header from "./Header";

interface Props {}

// Top level app component
const App: React.SFC<Props> = (props: Props) => {
  return (
    <Header />
  );
}

ReactDOM.render(<App />, document.querySelector("#app-header"));
