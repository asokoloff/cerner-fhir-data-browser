import axios from "axios";
import { path, pathOr } from "ramda";

const API_HOST =
  "https://fhir-open.sandboxcerner.com/dstu2/0b8a0111-e8e6-4c26-a91c-5069cbc6b1ca/";

const PATIENT_ENDPOINT = "Patient/";

const CONDITION_ENDPOINT = "Condition";

axios.defaults.headers.get["Accept"] = "application/json+fhir";

export function getPatient(patientId) {
  return axios.get(`${API_HOST}${PATIENT_ENDPOINT}${patientId}`).catch(e => {
    throw e.response;
  });
}

export function getConditions(patientId) {
  return axios
    .get(`${API_HOST}${CONDITION_ENDPOINT}?patient=${patientId}`)
    .catch(e => {
      throw e.response;
    });
}

export function extractPatientDemographics(response) {
  const nameData = path(["data", "name"], response);
  const gender = pathOr("Unknown", ["data", "gender"], response);
  const birthDate = pathOr("Unknown", ["data", "birthDate"], response);
  let name = "Unknown";

  if (Array.isArray(nameData)) {
    const officialName = nameData.find(obj => obj.use === "official");
    name = officialName ? officialName.text : name;
  }

  return { name, gender, birthDate };
}

export function extractPatientConditions(response) {
  const conditions = pathOr([], ["data", "entry"], response);
  return conditions
    .filter(c => {
      const verificationStatus = path(["resource", "verificationStatus"], c);
      return verificationStatus !== "entered-in-error";
    })
    .map(c => {
      const name = pathOr("N/A", ["resource", "code", "text"], c);
      const dateRecorded = pathOr("N/A", ["resource", "dateRecorded"], c);
      const encodedSearchString = encodeURIComponent(
        path(["resource", "code", "text"], c)
      );
      return { name, dateRecorded, encodedSearchString };
    });
}
