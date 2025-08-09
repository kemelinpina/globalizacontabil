import { prisma } from '../lib/prisma'
import { NextApiRequest } from 'next'

export interface LogData {
  userId?: number
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'VIEW'
  tableName: string
  recordId?: number
  recordName?: string
  oldData?: any
  newData?: any
  description?: string
}

export interface RequestInfo {
  ipAddress?: string
  userAgent?: string
}

/**
 * Extrai informações da requisição (IP e User-Agent)
 */
export function getRequestInfo(req: NextApiRequest): RequestInfo {
  const ipAddress = req.headers['x-forwarded-for'] || 
                   req.headers['x-real-ip'] || 
                   req.connection?.remoteAddress || 
                   req.socket?.remoteAddress ||
                   'unknown'

  const userAgent = req.headers['user-agent'] || 'unknown'

  return {
    ipAddress: Array.isArray(ipAddress) ? ipAddress[0] : ipAddress,
    userAgent
  }
}

/**
 * Registra uma ação no sistema de logs
 */
export async function createLog(logData: LogData, requestInfo?: RequestInfo) {
  try {
    const log = await prisma.logs.create({
      data: {
        user_id: logData.userId || null,
        action: logData.action,
        table_name: logData.tableName,
        record_id: logData.recordId || null,
        record_name: logData.recordName || null,
        old_data: logData.oldData ? JSON.stringify(logData.oldData) : null,
        new_data: logData.newData ? JSON.stringify(logData.newData) : null,
        ip_address: requestInfo?.ipAddress || null,
        user_agent: requestInfo?.userAgent || null,
        description: logData.description || null,
      }
    })

    return log
  } catch (error) {
    console.error('Erro ao criar log:', error)
    // Não queremos que erros de log quebrem a aplicação principal
    return null
  }
}

/**
 * Função simplificada para logs de criação
 */
export async function logCreate(
  userId: number | undefined,
  tableName: string,
  recordId: number,
  recordName: string,
  newData: any,
  req?: NextApiRequest,
  description?: string
) {
  const requestInfo = req ? getRequestInfo(req) : undefined
  
  return createLog({
    userId,
    action: 'CREATE',
    tableName,
    recordId,
    recordName,
    newData,
    description
  }, requestInfo)
}

/**
 * Função simplificada para logs de atualização
 */
export async function logUpdate(
  userId: number | undefined,
  tableName: string,
  recordId: number,
  recordName: string,
  oldData: any,
  newData: any,
  req?: NextApiRequest,
  description?: string
) {
  const requestInfo = req ? getRequestInfo(req) : undefined
  
  return createLog({
    userId,
    action: 'UPDATE',
    tableName,
    recordId,
    recordName,
    oldData,
    newData,
    description
  }, requestInfo)
}

/**
 * Função simplificada para logs de exclusão
 */
export async function logDelete(
  userId: number | undefined,
  tableName: string,
  recordId: number,
  recordName: string,
  oldData: any,
  req?: NextApiRequest,
  description?: string
) {
  const requestInfo = req ? getRequestInfo(req) : undefined
  
  return createLog({
    userId,
    action: 'DELETE',
    tableName,
    recordId,
    recordName,
    oldData,
    description
  }, requestInfo)
}

/**
 * Função simplificada para logs de login/logout
 */
export async function logAuth(
  userId: number | undefined,
  action: 'LOGIN' | 'LOGOUT',
  req?: NextApiRequest,
  description?: string
) {
  const requestInfo = req ? getRequestInfo(req) : undefined
  
  return createLog({
    userId,
    action,
    tableName: 'users',
    description
  }, requestInfo)
}

/**
 * Mapeia nomes de tabelas para nomes mais amigáveis
 */
export function getTableDisplayName(tableName: string): string {
  const tableNames: Record<string, string> = {
    'posts': 'Posts',
    'categories': 'Categorias',
    'users': 'Usuários',
    'pages': 'Páginas',
    'files': 'Arquivos',
    'menus': 'Menus',
    'menu_items': 'Itens do Menu',
    'contacts': 'Contatos',
    'home_about': 'Sobre (Home)',
    'banner_whatsapp': 'Banner WhatsApp'
  }

  return tableNames[tableName] || tableName
}

/**
 * Mapeia ações para nomes mais amigáveis
 */
export function getActionDisplayName(action: string): string {
  const actionNames: Record<string, string> = {
    'CREATE': 'Criou',
    'UPDATE': 'Editou',
    'DELETE': 'Excluiu',
    'LOGIN': 'Fez login',
    'LOGOUT': 'Fez logout',
    'VIEW': 'Visualizou'
  }

  return actionNames[action] || action
}
