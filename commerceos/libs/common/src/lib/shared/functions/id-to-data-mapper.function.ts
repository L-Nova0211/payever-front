export function IdToDataMapper(arrayOfIds: string[], arrayOfData: any[]): any[] {
  return arrayOfIds
    .map((id) => {
      return arrayOfData?.find((data) => {
        return data.id 
          ? data.id === id
          : data._id === id;
      });
    })
    .filter(Boolean);
}
