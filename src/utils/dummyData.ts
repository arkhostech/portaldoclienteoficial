
export type StatusType = 'waiting' | 'in-progress' | 'completed';

export interface CaseStatus {
  id: string;
  title: string;
  status: StatusType;
  currentStep: string;
  nextSteps: string;
  lastUpdated: string;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  category: string;
  uploadedBy: string;
  uploadDate: string;
  size: string;
  needsSignature: boolean;
  signed: boolean;
}

export interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  read: boolean;
  attachments?: string[];
}

export interface Payment {
  id: string;
  description: string;
  amount: number;
  date: string;
  status: 'paid' | 'pending' | 'overdue';
}

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  completed: boolean;
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  description: string;
  category: string;
  url: string;
}

// Mock data
export const caseStatuses: CaseStatus[] = [
  {
    id: '1',
    title: 'Processo de Visto EB-2 NIW',
    status: 'in-progress',
    currentStep: 'Petição em análise pelo USCIS',
    nextSteps: 'Aguardando resposta oficial (estimativa: 2-4 semanas)',
    lastUpdated: '2023-04-05T10:30:00Z'
  },
  {
    id: '2',
    title: 'Renovação de Green Card',
    status: 'waiting',
    currentStep: 'Documentação sendo preparada',
    nextSteps: 'Envio de documentos pendentes pelo cliente',
    lastUpdated: '2023-04-01T14:20:00Z'
  }
];

export const documents: Document[] = [
  {
    id: 'doc1',
    name: 'Autorização de Representação.pdf',
    type: 'PDF',
    category: 'Documentos Pessoais',
    uploadedBy: 'Advogado',
    uploadDate: '2023-03-28T09:15:00Z',
    size: '1.2 MB',
    needsSignature: true,
    signed: false
  },
  {
    id: 'doc2',
    name: 'Passaporte.jpg',
    type: 'JPG',
    category: 'Documentos Pessoais',
    uploadedBy: 'Cliente',
    uploadDate: '2023-03-25T11:30:00Z',
    size: '3.4 MB',
    needsSignature: false,
    signed: false
  },
  {
    id: 'doc3',
    name: 'Contrato de Trabalho.pdf',
    type: 'PDF',
    category: 'Documentos Profissionais',
    uploadedBy: 'Cliente',
    uploadDate: '2023-03-20T15:45:00Z',
    size: '2.1 MB',
    needsSignature: false,
    signed: false
  },
  {
    id: 'doc4',
    name: 'Petição I-140.pdf',
    type: 'PDF',
    category: 'Formulários Oficiais',
    uploadedBy: 'Advogado',
    uploadDate: '2023-03-15T13:10:00Z',
    size: '4.5 MB',
    needsSignature: true,
    signed: true
  }
];

export const messages: Message[] = [
  {
    id: 'msg1',
    sender: 'Advogado',
    content: 'Precisamos que você envie os documentos de comprovante de residência até sexta-feira.',
    timestamp: '2023-04-04T10:30:00Z',
    read: true
  },
  {
    id: 'msg2',
    sender: 'Cliente',
    content: 'Acabei de enviar o comprovante de residência na área de documentos.',
    timestamp: '2023-04-05T09:15:00Z',
    read: true
  },
  {
    id: 'msg3',
    sender: 'Advogado',
    content: 'Perfeito! Vou revisar e incluir na petição.',
    timestamp: '2023-04-05T11:20:00Z',
    read: false
  }
];

export const payments: Payment[] = [
  {
    id: 'pay1',
    description: 'Consulta Inicial',
    amount: 500.00,
    date: '2023-03-10T00:00:00Z',
    status: 'paid'
  },
  {
    id: 'pay2',
    description: 'Preparação da Petição',
    amount: 1500.00,
    date: '2023-03-20T00:00:00Z',
    status: 'paid'
  },
  {
    id: 'pay3',
    description: 'Taxa do USCIS',
    amount: 700.00,
    date: '2023-04-10T00:00:00Z',
    status: 'pending'
  }
];

export const tasks: Task[] = [
  {
    id: 'task1',
    title: 'Enviar comprovante de residência',
    description: 'Precisamos do seu comprovante de residência atual para completar a petição.',
    dueDate: '2023-04-07T00:00:00Z',
    completed: true
  },
  {
    id: 'task2',
    title: 'Assinar contrato de representação',
    description: 'Por favor assine digitalmente o contrato de representação no sistema.',
    dueDate: '2023-04-08T00:00:00Z',
    completed: false
  },
  {
    id: 'task3',
    title: 'Completar formulário biográfico',
    description: 'Preencher o formulário com suas informações biográficas completas.',
    dueDate: '2023-04-12T00:00:00Z',
    completed: false
  }
];

export const knowledgeArticles: KnowledgeArticle[] = [
  {
    id: 'art1',
    title: 'Processo EB-2 NIW: O que esperar',
    description: 'Um guia completo sobre o processo de visto EB-2 com National Interest Waiver.',
    category: 'Processos de Imigração',
    url: '/knowledge/eb2-niw-guide'
  },
  {
    id: 'art2',
    title: 'Documentos necessários para processos imigratórios',
    description: 'Lista completa de documentos frequentemente solicitados em processos imigratórios.',
    category: 'Documentação',
    url: '/knowledge/immigration-documents'
  },
  {
    id: 'art3',
    title: 'Como responder a um RFE do USCIS',
    description: 'Guia passo a passo para responder adequadamente a um Request for Evidence.',
    category: 'Procedimentos USCIS',
    url: '/knowledge/rfe-response-guide'
  }
];
