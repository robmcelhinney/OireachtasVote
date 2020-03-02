export const selectConstituency = (constituencyName: string) =>
{
  return {type: "selectConstituency", constituency: constituencyName };
};
