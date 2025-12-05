import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanupDuplicateNotifications() {
  try {
    console.log('Starting cleanup of duplicate notifications...')
    
    // Get all notifications grouped by user and message
    const allNotifications = await prisma.notificacion.findMany({
      orderBy: [
        { usuarioId: 'asc' },
        { mensaje: 'asc' },
        { fecha: 'desc' }
      ]
    })
    
    const seen = new Map<string, string>()
    const toDelete: string[] = []
    
    for (const notification of allNotifications) {
      const key = `${notification.usuarioId}-${notification.mensaje}`
      
      if (seen.has(key) && !notification.leido) {
        // This is a duplicate unread notification
        toDelete.push(notification.id)
      } else {
        seen.set(key, notification.id)
      }
    }
    
    if (toDelete.length > 0) {
      await prisma.notificacion.deleteMany({
        where: {
          id: { in: toDelete }
        }
      })
      console.log(`Deleted ${toDelete.length} duplicate notifications`)
    } else {
      console.log('No duplicate notifications found')
    }
    
    await prisma.$disconnect()
  } catch (error) {
    console.error('Error during cleanup:', error)
    await prisma.$disconnect()
    process.exit(1)
  }
}

cleanupDuplicateNotifications()
