export interface CertificateGenerateParams {
  registrationId: number;
  userId: number;
}

export interface CertificateData {
  certificateId: string;
  user: {
    name: string;
  };
  event: {
    id: number;
    title: string;
    eventType: {
      code: string;
    };
    startDate: Date;
    endDate: Date;
  };
}

export interface EventWithSignatures {
  id: number;
  title: string;
  eventType: string;
  startDate: Date;
  endDate: Date;
  signature1Name: string | null;
  signature1Title: string | null;
  signature1Image: string | null;
  signature2Name: string | null;
  signature2Title: string | null;
  signature2Image: string | null;
}

export interface PDFDownloadResult {
  stream: PDFKit.PDFDocument;
  fileName: string;
}

export interface VerificationResult {
  valid: boolean;
  certificate: {
    certificate_id: string;
    user_name: string;
    event_title: string;
    event_type: string;
    issued_at: Date;
    event_date: Date;
    event: {
      signature1Name: string | null;
      signature1Title: string | null;
      signature1Image: string | null;
      signature2Name: string | null;
      signature2Title: string | null;
      signature2Image: string | null;
    };
  };
}
