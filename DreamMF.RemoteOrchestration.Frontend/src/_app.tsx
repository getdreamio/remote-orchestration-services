import { BrowserRouter } from "react-router-dom";
import ApplicationRoutes from "./_routing";

const Application = () => {

  return (
    <>
        <BrowserRouter>
          <ApplicationRoutes />
        </BrowserRouter>
    </>
  );
};

export default Application;