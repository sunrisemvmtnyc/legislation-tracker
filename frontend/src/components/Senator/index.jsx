import { useParams } from "react-router-dom";

function Senator() {
  const {senatorName} = useParams();
  return (
    <div>This is the senator {senatorName}&apos;s page</div>
  );
}

export default Senator;