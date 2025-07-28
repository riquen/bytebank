export const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error('Falha ao buscar dados')

    return res.json()
  })
