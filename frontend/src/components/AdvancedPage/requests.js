import { REQUEST_PAGE_SIZE } from '../../constants';
import { API_URL } from '../../requests';

export const fetchLegislators = async (
  abortController,
  setAssemblyMembers,
  setSenators
) => {
  let total = 1000; // Arbitrary - will be overwritten on first fetch
  let page = 0;
  const params = (page) =>
    new URLSearchParams({
      limit: REQUEST_PAGE_SIZE,
      offset: 1 + page * REQUEST_PAGE_SIZE,
      full: true,
    });

  while (total > 1 + page * REQUEST_PAGE_SIZE) {
    const res = await (
      await fetch(`${API_URL}/api/v1/members/2023?${params(page)}`, {
        signal: abortController.signal,
      })
    ).json();
    const members = res?.result?.items || [];
    const senators = members.filter(
      (m) => m.chamber.toLowerCase() === 'senate'
    );
    const assemblyMembers = members.filter(
      (m) => m.chamber.toLowerCase() === 'assembly'
    );
    setSenators((prev) => [...prev, ...senators]);
    setAssemblyMembers((prev) => [...prev, ...assemblyMembers]);

    total = res?.total || 0;
    page++;
  }
};
