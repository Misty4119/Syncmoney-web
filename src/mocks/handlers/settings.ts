import { http, HttpResponse } from 'msw'

export const settingsHandlers = [
  // Get settings
  http.get('/api/settings', () => {
    return HttpResponse.json({
      success: true,
      data: {
        theme: 'dark',
        language: 'zh-TW',
        serverName: 'Minecraft Server',
        currencyName: '金幣'
      }
    })
  }),

  // Update theme
  http.post('/api/settings/theme', async ({ request }) => {
    const body = await request.json() as { theme: string }
    return HttpResponse.json({
      success: true,
      data: { theme: body.theme }
    })
  }),

  // Update language
  http.post('/api/settings/language', async ({ request }) => {
    const body = await request.json() as { language: string }
    return HttpResponse.json({
      success: true,
      data: { language: body.language }
    })
  })
]
