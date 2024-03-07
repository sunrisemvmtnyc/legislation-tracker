import { useParams } from "react-router-dom";

function AssemblyMember() {
  const {memberName} = useParams();
  return (
    <div>This is the assembly member {memberName}&apos;s page</div>
  );
}

export default AssemblyMember;