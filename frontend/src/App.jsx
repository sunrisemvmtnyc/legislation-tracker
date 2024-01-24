import { Route, Routes } from "react-router-dom";
import { createTheme } from '@mui/material/styles';
import { ThemeProvider } from "@mui/material/styles";
import Tracker from "./components/Tracker";
import Status from "./components/Status";
import Senator from "./components/Senator";
import AssemblyMember from "./components/AssemblyMember";

import "./index.css";
import BillList from "./components/BillList";
import Bill from "./components/Bill";

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
      <div className="App">
        <Routes>
          <Route path="/" element={<BillList bills={BILLS} />}></Route>
          <Route path="/tracker" element={<Tracker />}></Route>
          <Route path="/status" element={<Status />}></Route>
          <Route
            path="/assembly/:memberName"
            element={<AssemblyMember />}
          ></Route>
          <Route path="/senate/:senatorName" element={<Senator />}></Route>
          <Route path="/bill/:sessionYear/:printNo" element={<Bill />}></Route>
        </Routes>
      </div>
    </ThemeProvider>
  );
}

export default App;
