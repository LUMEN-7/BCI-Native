import apiFetch, {
  apiFetchMultipart,
} from "./api";

export function startSearch(payload) {
  return apiFetch("/Pesquisa/busca", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getJobStatus(jobId) {
  return apiFetch(
    `/Pesquisa/jobs/${jobId}`
  );
}

export function getCars(
  page = 1,
  pageSize = 50
) {
  return apiFetch(
    `/Carro/listar?pagina=${page}&tamanhoPagina=${pageSize}`
  );
}

export function getCar(lineageId) {
  return apiFetch(
    `/Carro/recente/${lineageId}`
  );
}

export function getCarVersions(
  lineageId
) {
  return apiFetch(
    `/Carro/${lineageId}/versoes`
  );
}

export function getCarVersion(carId) {
  return apiFetch(
    `/Carro/versao/${carId}`
  );
}

export function getCarImage(carId) {
  return apiFetch(
    `/Carro/Imagem-Carro/${carId}`
  );
}

/*
 * Importação de veículo.
 *
 * Mesmo endpoint utilizado pelo BCI Web:
 * POST /Carro/importar-arquivo
 */
export async function importVehicle(
  payload
) {
  const formData = new FormData();

  const json = JSON.stringify(
    payload,
    null,
    2
  );

  const blob = new Blob(
    [json],
    {
      type: "application/json",
    }
  );

  formData.append(
    "arquivo",
    blob,
    "importacao-mobile.json"
  );

  return apiFetchMultipart(
    "/Carro/importar-arquivo",
    formData
  );
}