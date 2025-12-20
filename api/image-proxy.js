export default async function handler(request, response) {
  if (request.method !== 'GET') {
    response.status(405).json({ error: 'Método não permitido.' })
    return
  }

  const { url } = request.query || {}
  if (!url || typeof url !== 'string') {
    response.status(400).json({ error: 'URL inválida.' })
    return
  }

  try {
    const upstream = await fetch(url)
    if (!upstream.ok) {
      response.status(upstream.status).json({ error: 'Falha ao buscar a imagem.' })
      return
    }

    const contentType = upstream.headers.get('content-type') || 'image/png'
    const buffer = Buffer.from(await upstream.arrayBuffer())

    response.setHeader('Access-Control-Allow-Origin', '*')
    response.setHeader('Content-Type', contentType)
    response.status(200).send(buffer)
  } catch (error) {
    response.status(500).json({ error: 'Erro ao processar o proxy de imagem.' })
  }
}
