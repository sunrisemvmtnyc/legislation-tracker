import { Route, Routes } from "react-router-dom";
import { createTheme } from "@material-ui/core/styles";
import { ThemeProvider } from "@material-ui/styles";
import Tracker from "./components/Tracker";
import Senator from "./components/Senator";
import AssemblyMember from "./components/AssemblyMember";
import Header2 from "./components/Header2";
import Home from "./components/Home";
import Footer from "./components/Footer";
import "./index.css";
import "./App.css";
import BillList from "./components/BillList";

const BILLS = [
  ["2019", "S8496"],
  ["2019", "S2574b"],
  ["2019", "S3253b"],
  ["2019", "A6144"],
  ["2019", "S3595b"],
  ["2019", "A10609"],
  ["2019", "A1531"],
  ["2019", "S6601a"],
  ["2019", "S8493"],
  ["2019", "A10608"],
];

const THEME = createTheme({
  typography: {
    fontFamily: `"Fjalla One", "Roboto", "Helvetica", "Arial", sans-serif`,
  },
});

function App() {
  return (
    <ThemeProvider theme={THEME}>
      <Header2 />
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />}></Route>
          <Route path="/tracker" element={<Tracker />}></Route>
          <Route path="/status" element={<BillList bills={BILLS} />}></Route>
          <Route
            path="/assembly/:memberName"
            element={<AssemblyMember />}
          ></Route>
          <Route path="/senate/:senatorName" element={<Senator />}></Route>
        </Routes>
      </div>
      <Footer />
    </ThemeProvider>
  );
}

export default App;
