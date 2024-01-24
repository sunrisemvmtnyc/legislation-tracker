import {PropTypes} from "prop-types"
import {useState, useEffect} from "react"
import { useParams } from "react-router-dom"

const RelatedBills = ({related}) => {
  if (!related) return <div>No related bills</div>
  return (
    <div>
      {Object.values(related).map((bill) => (<div key={bill.printNo}><a href={`/bill/${bill.session}/${bill.printNo}`}>{bill.printNo}</a>: {bill.title}</div>))}
    </div>
  );
  }
RelatedBills.propTypes = {
  related: PropTypes.object.isRequired,
};

export const Bill = () => {
  const {sessionYear, printNo} = useParams();
  const [bill, setBill] = useState();

  useEffect(() => {
    const fetchBill = async() => {
      const res = await fetch(`/api/v1/bills/${sessionYear}/${printNo}`);
      await setBill(await res.json());
    }
    fetchBill()
  }, [])

  if (!bill) return (
    <div>
      <div>This is the bill {printNo}&apos;s page</div>
    </div>
  )

  const {title, summary, sponsor: {member: {memberId: sponsorId, fullName: sponsorName}}} = bill;

  return (
    <div>
      <div>This is the bill {printNo}&apos;s page</div>
      <h2>{title}</h2>
      <p>{summary}</p>
      <div><span>{sponsorName}:{sponsorId}</span></div>
      <RelatedBills related={bill.billInfoRefs.items} />
    </div>
  )

}