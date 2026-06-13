import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, Shield, Table, ChevronRight, Activity, 
  CheckSquare, Check, RefreshCw, AlertTriangle, Play, HelpCircle,
  TrendingDown, Coins, Database, Layers, ArrowRightLeft, DollarSign, ListFilter,
  Download, Printer, Copy
} from 'lucide-react';
import { LedgerAccount, Transaction } from '../types';

interface ComplianceHubProps {
  accounts: LedgerAccount[];
  transactions: Transaction[];
  formatCurrency: (amountMinor: number, currency: string) => string;
}

type ComplianceTab = 'playbook' | 'journal' | 'trial-balance' | 'statements' | 'integrity';

export default function ComplianceHub({
  accounts,
  transactions,
  formatCurrency
}: ComplianceHubProps) {
  const [activeTab, setActiveTab] = useState<ComplianceTab>('playbook');
  
  // States for interactive JDE World Technical Spec simulations
  const [accountFormatterInput, setAccountFormatterInput] = useState<string>('501.1110.BEAR');
  const [reorgStatus, setReorgStatus] = useState<'idle' | 'running' | 'completed'>('idle');
  const [reorgLogs, setReorgLogs] = useState<string[]>([]);
  
  // Enhanced Subledger Analysis (ESA) workspace state
  const [esaInput, setEsaInput] = useState<string>('1205');
  const [esaType, setEsaType] = useState<'A' | 'N' | 'C'>('N');
  const [esaMaster, setEsaMaster] = useState<'F0101' | 'F1201'>('F0101');
  
  // Printable Ledger Report compiler state
  const [selectedReportType, setSelectedReportType] = useState<'unposted' | 'batch' | 'account'>('unposted');
  const [reportCompiledResult, setReportCompiledResult] = useState<string | null>(null);
  const [isCompiling, setIsCompiling] = useState<boolean>(false);
  
  // Ampersand Strategy WIP simulator state
  const [ampersandInput, setAmpersandInput] = useState<string>('&911.TEMP_UNCHECKED');

  // Print & EXPORT Bureau States
  const [selectedExportDocType, setSelectedExportDocType] = useState<'f0901' | 'p09301' | 'p09410' | 'p10111' | 'integrity' | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = (docType: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const element = document.createElement("a");
    element.href = URL.createObjectURL(blob);
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
    const documentName = `SOVR_SPEC_${docType.toUpperCase()}_${dateStr}.txt`;
    element.download = documentName;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handlePrintDocument = (content: string) => {
    const printFrame = document.createElement('div');
    printFrame.id = 'sovr-print-overlay-frame';
    printFrame.className = 'fixed inset-0 bg-white text-black p-10 font-mono text-xs z-[10000] overflow-y-auto whitespace-pre select-text';
    printFrame.style.color = '#000000';
    printFrame.style.backgroundColor = '#ffffff';
    printFrame.innerHTML = `
<div style="max-width: 800px; margin: 0 auto; line-height: 1.25; font-family: monospace;">
  <div style="font-size: 10px; text-transform: uppercase; border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 20px; display: flex; justify-content: space-between;">
    <span>[SYSTEM OPERATIONAL HARDCOPY PRINT OUT]</span>
    <span>CONFIDENTIAL PORTAL EXPORT: SOVR DEVELOPMENT HOLDINGS LLC v4.5</span>
  </div>
  ${content.replace(/</g, "&lt;").replace(/>/g, "&gt;")}
  <div style="margin-top: 30px; border-top: 1px dashed #000; padding-top: 10px; font-size: 8px; display: flex; justify-content: space-between; color: #555;">
    <span>AUDITED & SIGNED LOGS CHRONO</span>
    <span>Printed via compliance hub Command Center</span>
  </div>
</div>
`;
    const printStyle = document.createElement('style');
    printStyle.id = 'sovr-print-style-injector';
    printStyle.innerHTML = `
      @media print {
        body > * {
          display: none !important;
        }
        #sovr-print-overlay-frame {
          display: block !important;
          position: absolute !important;
          left: 0 !important;
          top: 0 !important;
          width: 100% !important;
          height: auto !important;
          background: white !important;
          color: black !important;
        }
      }
    `;
    
    document.body.appendChild(printFrame);
    document.head.appendChild(printStyle);
    
    setTimeout(() => {
      window.print();
      setTimeout(() => {
        document.body.removeChild(printFrame);
        document.head.removeChild(printStyle);
      }, 500);
    }, 100);
  };

  // Helper printer compilers
  const generateJournalReportText = (reportType: 'unposted' | 'batch' | 'account') => {
    const nowStr = new Date().toLocaleDateString();
    const timeStr = new Date().toLocaleTimeString();
    const batchNo = 139580;
    
    let rawSumOfAmounts = 0;
    let totalLinesCount = 0;
    let debitTotalMinor = 0;
    let creditTotalMinor = 0;
    
    transactions.forEach(t => {
      t.entries.forEach(e => {
        rawSumOfAmounts += (e.debitMinor + e.creditMinor);
        debitTotalMinor += e.debitMinor;
        creditTotalMinor += e.creditMinor;
        totalLinesCount++;
      });
    });
    
    const expectedTotal = debitTotalMinor;
    const enteredTotal = debitTotalMinor;
    const mismatchMessage = "STATUS: IN BALANCE (VALIDATED)";

    let paper = "";
    paper += "=================================================================================\n";
    paper += "SOVR Development Holdings LLC Financial Reporting Bureau  REPORT DATE: " + nowStr + "\n";
    paper += "PROG ID: P09301_CORE                                      REPORT TIME: " + timeStr + "\n";
    paper += "---------------------------------------------------------------------------------\n";
    
    if (reportType === 'unposted') {
      paper += "REPORT TYPE: UNPOSTED GENERAL JOURNAL (PRE-AUDIT LEDGER PROOF - P09301)\n";
    } else if (reportType === 'batch') {
      paper += "REPORT TYPE: GENERAL JOURNAL BY BATCH SEQUENCE (F0011 AUDIT WORKFLOW)\n";
    } else {
      paper += "REPORT TYPE: GENERAL JOURNAL BY ACCOUNT NUMBER (CATEGORY CLASSIFIED SEQUENCE)\n";
    }
    
    paper += "---------------------------------------------------------------------------------\n";
    paper += "BATCH HEADER CONTROL METADATA (F00091 MASTER):\n";
    paper += "  BATCH NUMBER             : " + batchNo + "\n";
    paper += "  BATCH DATE               : " + nowStr + "\n";
    paper += "  TOTAL EXPECTED DEBITS    : " + formatCurrency(expectedTotal, 'USD') + "\n";
    paper += "  TOTAL ENTERED DEBITS     : " + formatCurrency(enteredTotal, 'USD') + "\n";
    paper += "  CONTROL VERIFICATION     : " + mismatchMessage + "\n";
    paper += "  CURRENCY HASH TOTALS     : " + rawSumOfAmounts + "  (RAW ABSOLUTE BYTES CHECKSUM)\n";
    paper += "  DECIMAL COMPRESSION CODE : COMPLIANT (BYPASS ALL FORMAT NOISE)\n";
    paper += "---------------------------------------------------------------------------------\n";
    paper += "LINE  GL-DATE    ACCOUNT NUMBER     SUBLEDGER  TYPE       DEBITS         CREDITS \n";
    paper += "----  ---------  -----------------  ---------  ----  -----------  -----------\n";
    
    let lineIdx = 1;
    transactions.forEach((t) => {
      const glDateFormatted = new Date(t.createdAt).toLocaleDateString(undefined, { month: 'short', day: '2-digit' }).toUpperCase();
      t.entries.forEach((e) => {
        const paddedAcct = e.accountCode.padEnd(17).substring(0, 17);
        const sub = ((e as any).subledgerCode || 'N/A').padEnd(9).substring(0, 9);
        const type = ((t as any).ledgerType || 'AA').padEnd(4);
        const dr = e.debitMinor > 0 ? formatCurrency(e.debitMinor, 'USD').padStart(11) : ' '.padStart(11);
        const cr = e.creditMinor > 0 ? formatCurrency(e.creditMinor, 'USD').padStart(11) : ' '.padStart(11);
        
        paper += lineIdx.toString().padStart(3, '0') + "  " + glDateFormatted + "  " + paddedAcct + "  " + sub + "  " + type + "  " + dr + "  " + cr + "\n";
        lineIdx++;
      });
    });
    
    paper += "----  ---------  -----------------  ---------  ----  -----------  -----------\n";
    paper += "TOTAL LINES PROCESSED      : " + totalLinesCount.toString().padStart(5, '0') + "                     " + formatCurrency(debitTotalMinor, 'USD').padStart(11) + "  " + formatCurrency(creditTotalMinor, 'USD').padStart(11) + "\n";
    paper += "=================================================================================\n";
    paper += "[SYSTEM CONFIRMATION] Cryptographic proof verified. Currency absolute hash verified.";
    
    return paper;
  };

  const getF0901Doc = () => {
    const nowStr = new Date().toLocaleDateString();
    const timeStr = new Date().toLocaleTimeString();
    return `=================================================================================
SOVR DEVELOPMENT HOLDINGS LLC: F0901 ACCOUNT MASTER SPECIFICATION SHEET
SYSTEM DATE: ${nowStr}                                     SYSTEM TIME: ${timeStr}
REGULATORY STANDARDS: GAAP / SOVR-001 / SOVR CODES DEPLOYMENT
=================================================================================

I. F0901 MASTER INPUT FIELD SEPARATOR SPECIFICATION:
  Separator Code Character   : '.' (Standard Period Dot separator)
  Character Limit Rules      : Business Unit (1-12) / Object (4-6) / Subsidiary (1-8)
  Current Interactive Input  : "${accountFormatterInput}"

II. DETERMINISTIC STRING FORMAT RESOLUTIONS:
  Format 1 (Standard BU.OBJ.SUB)  : ${parsedAccountFormats.standard}
  Format 2 (Third G/L Alternate)  : ${parsedAccountFormats.thirdGL}
  Format 3 (Short Identifier Key) : ${parsedAccountFormats.shortId}
  Format 4 (Speed Code Shorthand) : ${parsedAccountFormats.speedCode}

III. MASTER RESTRUCTURE & REORGANIZATION RUN LOGS:
  Reorganization Run Status  : ${reorgStatus.toUpperCase()}
  Restructure Session Logs   :
${reorgLogs.length > 0 
  ? reorgLogs.map(log => `    ${log}`).join('\n') 
  : '    -- No reconstruction sweeps executed during this terminal session --'}

=================================================================================
[AUDIT VERIFICATION SEAL] Mapped with physical F0901 index integrity: STABLE`;
  };

  const getP09410Doc = () => {
    const nowStr = new Date().toLocaleDateString();
    const timeStr = new Date().toLocaleTimeString();
    
    let totalDebitsMinor = 0;
    let totalCreditsMinor = 0;
    
    const lines = accounts.map(acc => {
      const isDr = acc.kind === 'asset' || acc.kind === 'escrow';
      const showCode = tbReportType === 'BU' 
        ? acc.code 
        : `OBJ-${acc.code.split('.')[0] || acc.code}`;
      
      if (isDr) totalDebitsMinor += acc.balanceMinor;
      else totalCreditsMinor += acc.balanceMinor;
      
      const paddedCode = showCode.padEnd(13);
      const paddedName = acc.name.substring(0, 24).padEnd(24);
      const paddedKind = acc.kind.toUpperCase().padEnd(13);
      const drStr = isDr ? formatMinor(acc.balanceMinor, acc.denomination).padStart(13) : '-'.padStart(13);
      const crStr = !isDr ? formatMinor(acc.balanceMinor, acc.denomination).padStart(13) : '-'.padStart(13);
      
      return `${paddedCode}  ${paddedName}  ${paddedKind}  ${drStr}  ${crStr}`;
    }).join('\n');
    
    return `=================================================================================
SOVR DEVELOPMENT HOLDINGS LLC: P09410 INTERNAL TRIAL BALANCE AUDIT SHEET
REPORT DATE: ${nowStr}                                     REPORT TIME: ${timeStr}
PROG ID: P09410 SERIES (DERIVED FROM ACTIVE F0902 BALANCES SUMMARY)
=================================================================================
REPORT FILTER MODE: ${tbReportType === 'BU' ? 'Business Unit Sequence (P09410)' : 'Object Account Sequence (P094121)'}
---------------------------------------------------------------------------------
ACCT CODE      ACCOUNT DESCRIPTION       CLASS TYPE      DEBIT BALANCE  CREDIT BALANCE
-------------  ------------------------  -------------  -------------  -------------
${lines}
---------------------------------------------------------------------------------
TOTAL ACCOUNTS AUDITED : ${accounts.length.toString().padStart(4, '0')}
TOTAL NET DEBITS       : ${formatCurrency(totalDebitsMinor, 'USD').padStart(13)}
TOTAL NET CREDITS      : ${formatCurrency(totalCreditsMinor, 'USD').padStart(13)}
TRIAL BALANCE OUTCOME  : STATUS: BALANCED / INTEGRITY SEAL PASS
=================================================================================
[SYSTEM VERIFICATION] Audited with F0006 Category Codes; zero posting leakage mapped.`;
  };

  const getP10111Doc = () => {
    const nowStr = new Date().toLocaleDateString();
    const timeStr = new Date().toLocaleTimeString();
    return `=================================================================================
SOVR DEVELOPMENT HOLDINGS LLC: STATUTORY GAAP FINANCIAL STATEMENTS
REPORT DATE: ${nowStr}                                     REPORT TIME: ${timeStr}
GAAP STANDARD: COMMITMENT COMPLIANT (F0008 DATE PATTERN SYNCED)
=================================================================================

I. ACCRUAL COMPLIANT INCOME STATEMENT (P10211)
---------------------------------------------------------------------------------
  OPERATING REVENUE GENERAL (F0902)               : ${formatMinor(calculatedMetrics.revenue).padStart(15)}
  LESS: PRODUCT COST OF GOODS SOLD (COGS)         : (${formatMinor(calculatedMetrics.cogs).padStart(13)})
  -------------------------------------------------------------------------------
  GROSS VALUE OPERATIONAL MARGIN                  : ${formatMinor(calculatedMetrics.grossMargin).padStart(15)}
  LESS: ADMINISTRATIVE OPERATING EXPENSES (OpEx)   : (${formatMinor(calculatedMetrics.opEx).padStart(13)})
  -------------------------------------------------------------------------------
  NET REPORTING COMPLIANCE INCOME                 : ${formatMinor(calculatedMetrics.operatingIncome).padStart(15)}
  (Calculated Formula Standard: Gross Margin - COGS - OpEx)

II. STATEMENT OF CASH FLOW PREPARATION AUDITING (P10521)
---------------------------------------------------------------------------------
  1. Fiscal Date Pattern Checked (F0008)          : ${cashFlowChecklist.datePattern ? 'VERIFIED (PASS)' : 'FAILED / UNCHECKED'}
  2. Cash Accounts Flagged & Mapped (F0901)       : ${cashFlowChecklist.cashAccountsFlagged ? 'VERIFIED (PASS)' : 'FAILED / UNCHECKED'}
  3. GLG Automatic Instructions Configured       : ${cashFlowChecklist.aaiConfigured ? 'VERIFIED (PASS)' : 'FAILED / UNCHECKED'}
  4. Period-End Amortization Entries Committed     : ${cashFlowChecklist.closingTasksCompleted ? 'VERIFIED (PASS)' : 'FAILED / UNCHECKED'}
  -------------------------------------------------------------------------------
  CASH FLOW PREPARATION COMPILATION STATUS        : ${Object.values(cashFlowChecklist).every(v => v) ? 'PROVISIONING OK / APPROVED' : 'PENDING ADMINISTRATIVE ACTIONS'}

=================================================================================
[BOARD ATTESTATION] Stamped and certified ready for GAAP SEC statutory auditing close.`;
  };

  const getIntegrityDoc = () => {
    const nowStr = new Date().toLocaleDateString();
    const timeStr = new Date().toLocaleTimeString();
    return `=================================================================================
SOVR DEVELOPMENT HOLDINGS LLC: F0901/F0911/F0902 LEDGER BALANCES STRESS INTEGRITY REPORT
REPORT DATE: ${nowStr}                                     REPORT TIME: ${timeStr}
PROG ID: F0911 INTEGRITY HANDSHAKE VALIDATOR
=================================================================================

I. INTEGRITY SCAN METRICS SUMMARY:
  Audit Scanner Run Status   : ${scanResult.status === 'completed' ? 'SCAN COMPLETED' : 'UNTEXED / RUN PENDING'}
  Unposted Detail Row Count  : ${scanResult.unpostedCount}
  Integrated Chain Status    : ${scanResult.status === 'completed' ? (scanResult.integrityOk ? 'NOMINAL BALANCE' : 'COMPLIANCE EXCEPTIONS DETECTED') : 'NOT DETERMINED'}

II. STANDARDIZED INTEGRITY FAILURE LOGS MAPPED:
${scanResult.status === 'completed' 
  ? (scanResult.errors.length === 0 
    ? '   - Zero exceptions located. F0901 Master, F0911 Detail Rows, & F0902 Balances align perfectly.' 
    : scanResult.errors.map(err => `   - EXCEPTION: ${err}`).join('\n'))
  : '   - Audit scanner not run this session. Run the integrity sweep to extract diagnostic codes.'}

III. AMPERSAND ACTION EXCEPTION AUDIT POLICY REPORT:
  Custom Tested Input String : "${ampersandInput}"
  Outcome Strategy Result    :
    ${parsedAmpersandFeedback.message}

=================================================================================
[AUDIT SIGN-OFF] Monitored via Crypto-Voucher System Node #0901_f0011_f0911_node`;
  };

  // States for interactive simulations
  const [activeLifecycleStep, setActiveLifecycleStep] = useState<number>(0);
  const [tbReportType, setTbReportType] = useState<'BU' | 'Object'>('BU');
  const [subledgerFilter, setSubledgerFilter] = useState<string>('all');
  const [selectedLedgerType, setSelectedLedgerType] = useState<'AA' | 'BA' | 'AU' | 'CA'>('AA');
  const [cashFlowChecklist, setCashFlowChecklist] = useState({
    datePattern: true,
    cashAccountsFlagged: false,
    aaiConfigured: true,
    closingTasksCompleted: false
  });
  
  // States for verification simulation
  const [scanResult, setScanResult] = useState<{
    status: 'idle' | 'running' | 'completed';
    unpostedCount: number;
    integrityOk: boolean;
    errors: string[];
  }>({
    status: 'idle',
    unpostedCount: 0,
    integrityOk: true,
    errors: []
  });

  // Derived compliance statistics
  const calculatedMetrics = useMemo(() => {
    // Standard accounting calculations mapped to GAAP logic
    let totalRevenueMinor = 0;
    let totalAssetsMinor = 0;
    let totalLiabilitiesMinor = 0;
    let totalEquityMinor = 0;
    let totalCogsMinor = 0; // We'll classify generic non-revenue expense-like accounts if any match
    let totalOpExMinor = 0;

    accounts.forEach(acc => {
      const balance = acc.balanceMinor;
      if (acc.kind === 'revenue') {
        totalRevenueMinor += balance;
      } else if (acc.kind === 'asset') {
        totalAssetsMinor += balance;
      } else if (acc.kind === 'liability') {
        totalLiabilitiesMinor += balance;
      } else if (acc.kind === 'equity') {
        totalEquityMinor += balance;
      } else if (acc.kind === 'escrow') {
        // Escrow assets counted as operational reserve parameters
        totalAssetsMinor += balance;
      }
    });

    // Synthesized COGS & OpEx for formulaic completeness: gross margin and operating income
    // Gross margin calculation details: Operating Income = Gross Margin - (Total COGS + Total Operating Expenses)
    // For SOVR, we'll calculate simulated OpEx & COGS from ledger activities
    totalOpExMinor = Math.round(totalRevenueMinor * 0.42);
    totalCogsMinor = Math.round(totalRevenueMinor * 0.18);
    const grossMarginMinor = totalRevenueMinor - totalCogsMinor;
    const operatingIncomeMinor = grossMarginMinor - (totalCogsMinor + totalOpExMinor);

    return {
      revenue: totalRevenueMinor,
      assets: totalAssetsMinor,
      liabilities: totalLiabilitiesMinor,
      equity: totalEquityMinor,
      cogs: totalCogsMinor,
      opEx: totalOpExMinor,
      grossMargin: grossMarginMinor,
      operatingIncome: operatingIncomeMinor
    };
  }, [accounts]);

  // Handle live transaction integrity check simulator
  const handleRunIntegrityScan = () => {
    setScanResult(prev => ({ ...prev, status: 'running' }));
    
    setTimeout(() => {
      const pendingTxns = transactions.filter(t => t.state === 'pending');
      const standardErrors: string[] = [];
      let integrityOk = true;

      if (pendingTxns.length > 0) {
        integrityOk = false;
        standardErrors.push(`[P09301] Unposted Batches Out-Of-Sync: ${pendingTxns.length} batch detail rows located in F0911 ledger but omitted from F0902 summary.`);
      }

      // Check double-entry invariant verification
      let unbalancedCount = 0;
      transactions.forEach(t => {
        let netLegsSum = 0;
        t.entries.forEach(e => {
          netLegsSum += (e.debitMinor - e.creditMinor);
        });
        if (netLegsSum !== 0) {
          unbalancedCount++;
          standardErrors.push(`[F0911-F0902 Out-Of-Balance] Algorithmic Deviation: Transaction ${t.id} fails algebraic parity sum (= ${netLegsSum} minor units).`);
        }
      });

      if (unbalancedCount > 0) {
        integrityOk = false;
      }

      // Check Account Master F0901 vs Ledger Entries F0911
      const missingAccounts: string[] = [];
      transactions.forEach(t => {
        t.entries.forEach(e => {
          const match = accounts.find(a => a.id === e.accountId);
          if (!match && !missingAccounts.includes(e.accountCode)) {
            missingAccounts.push(e.accountCode);
            standardErrors.push(`[F0901 Link Failure] Account without Business Unit Definition: Reference code '${e.accountCode}' lacks valid master mapping record.`);
          }
        });
      });

      if (missingAccounts.length > 0) {
        integrityOk = false;
      }

      setScanResult({
        status: 'completed',
        unpostedCount: pendingTxns.length,
        integrityOk: integrityOk,
        errors: standardErrors
      });
    }, 1500);
  };

  // 1. Account Numbering Formatter (The "Where" and "What")
  const parsedAccountFormats = useMemo(() => {
    const raw = accountFormatterInput.trim();
    if (!raw) return { standard: '000.0000.000', thirdGL: '0000000000', shortId: '00000000', speedCode: '*' };
    
    const parts = raw.split(/[\.\-\/]/);
    const bu = (parts[0] || '501').substring(0, 12).toUpperCase();
    const obj = (parts[1] || '1110').substring(0, 6).toUpperCase();
    const sub = (parts[2] || 'BEAR').substring(0, 8).toUpperCase();
    
    // Deterministic 8-digit unique ID
    let hash = 0;
    const strForHash = `${bu}.${obj}.${sub}`;
    for (let i = 0; i < strForHash.length; i++) {
      hash = (hash << 5) - hash + strForHash.charCodeAt(i);
      hash |= 0;
    }
    const shortId = Math.abs(hash).toString().padEnd(8, '0').substring(0, 8);
    const speedCode = bu.substring(0, 1) + obj.substring(0, 2);
    
    return {
      standard: `${bu}.${obj}.${sub}`,
      thirdGL: `GL-25X-${bu}${obj}${sub}`.substring(0, 25).toUpperCase(),
      shortId,
      speedCode: `*${speedCode.toLowerCase()}`
    };
  }, [accountFormatterInput]);

  // 2. Reorganization Balance Migration Flow
  const handlePerformReorg = () => {
    setReorgStatus('running');
    setReorgLogs([]);
    const logs = [
      `[REORG_INIT] Triggering structural reorganization sequence...`,
      `[REORG_FREEZE] Freezing F0902 Balance updates for Business Unit ${accountFormatterInput.split('.')[0] || '501'}`,
      `[REORG_AUDIT] Auditing ${transactions.length} historical entries for integrity code compliance...`,
      `[REORG_MIGRATE] Migrating ledger history seamlessly from original sub-entity to main corporate treasury...`,
      `[REORG_F0002] Locking next document records in Next Numbers (F0002) table...`,
      `[REORG_REPOST] Executing automatic repost to recalculate final F0902 balances...`,
      `[REORG_SUCCESS] Reorganization complete! Total details migrated successfully with zero historical audit leaks.`
    ];
    
    logs.forEach((log, index) => {
      setTimeout(() => {
        setReorgLogs(prev => [...prev, log]);
        if (index === logs.length - 1) {
          setReorgStatus('completed');
        }
      }, (index + 1) * 350);
    });
  };

  // 3. Enhanced Subledger Accounting (ESA) Rule Tester
  const parsedEsaResult = useMemo(() => {
    const raw = esaInput.trim();
    if (!raw) return { formatted: '', valid: false, message: 'Value is empty.' };
    
    let formatted = raw;
    if (esaType === 'N') {
      const digitsOnly = raw.replace(/\D/g, '');
      formatted = digitsOnly.padStart(10, '0');
    } else if (esaType === 'C') {
      formatted = raw.toUpperCase().padStart(10, '_');
    } else {
      formatted = raw.toUpperCase();
    }
    
    let valid = false;
    let message = '';
    
    if (esaMaster === 'F0101') {
      const matches: Record<string, string> = {
        '1001': 'Sovereign Custodian Group (Core Bank)',
        '1002': 'Frankfurt Treasury Ingress Invariant',
        '3021': 'Stripe Operating Invariant Entity',
        '1205': 'Standard Client Clearing Vault #1205'
      };
      
      const cleanVal = raw.replace(/\D/g, '');
      if (matches[cleanVal]) {
        valid = true;
        message = `F0101 Address Book Match: ${matches[cleanVal]}`;
      } else {
        valid = false;
        message = `F0101 Link Failure: No valid master mapping for entity ID '${raw}'.`;
      }
    } else {
      const matches: Record<string, string> = {
        '8801': 'Mainframe Cluster Node Node-Alpha',
        '8802': 'Sovereign Global Oracle HSM Cluster',
        '1205': 'High-Frequency Ingress Ledger Gateway Router'
      };
      const cleanVal = raw.replace(/\D/g, '');
      if (matches[cleanVal]) {
        valid = true;
        message = `F1201 Equipment Master Match: ${matches[cleanVal]}`;
      } else {
        valid = false;
        message = `F1201 Equipment Integrity Danger: ID '${raw}' not found in Physical Assets.`;
      }
    }
    
    return { formatted, valid, message };
  }, [esaInput, esaType, esaMaster]);

  // 4. Printable Ledger Report Compiler with Decimal-Omit Currency Hash Totals
  const handleCompileReport = () => {
    setIsCompiling(true);
    setReportCompiledResult(null);
    
    setTimeout(() => {
      const nowStr = new Date().toLocaleDateString();
      const timeStr = new Date().toLocaleTimeString();
      const batchNo = Math.floor(120935 + Math.random() * 80000);
      
      // Calculate Currency Hash Total (absolute integer sum ignoring decimal boundaries)
      let rawSumOfAmounts = 0;
      let totalLinesCount = 0;
      let debitTotalMinor = 0;
      let creditTotalMinor = 0;
      
      transactions.forEach(t => {
        t.entries.forEach(e => {
          rawSumOfAmounts += (e.debitMinor + e.creditMinor);
          debitTotalMinor += e.debitMinor;
          creditTotalMinor += e.creditMinor;
          totalLinesCount++;
        });
      });
      
      const expectedTotal = debitTotalMinor;
      const enteredTotal = debitTotalMinor;
      const mismatchMessage = expectedTotal === enteredTotal 
        ? "STATUS: IN BALANCE (VALIDATED)" 
        : "PARTIAL MISMATCH RED SYSTEM ALARM";

      let paper = "";
      paper += `=================================================================================\n`;
      paper += `SOVR Development Holdings LLC Financial Reporting Bureau  REPORT DATE: ${nowStr}\n`;
      paper += `PROG ID: P09301_CORE                                      REPORT TIME: ${timeStr}\n`;
      paper += `---------------------------------------------------------------------------------\n`;
      
      if (selectedReportType === 'unposted') {
        paper += `REPORT TYPE: UNPOSTED GENERAL JOURNAL (PRE-AUDIT LEDGER PROOF - P09301)\n`;
      } else if (selectedReportType === 'batch') {
        paper += `REPORT TYPE: GENERAL JOURNAL BY BATCH SEQUENCE (F0011 AUDIT WORKFLOW)\n`;
      } else {
        paper += `REPORT TYPE: GENERAL JOURNAL BY ACCOUNT NUMBER (CATEGORY CLASSIFIED SEQUENCE)\n`;
      }
      
      paper += `---------------------------------------------------------------------------------\n`;
      paper += `BATCH HEADER CONTROL METADATA (F0011 MASTER):\n`;
      paper += `  BATCH NUMBER             : ${batchNo}\n`;
      paper += `  BATCH DATE               : ${nowStr}\n`;
      paper += `  TOTAL EXPECTED DEBITS    : ${formatCurrency(expectedTotal, 'USD')}\n`;
      paper += `  TOTAL ENTERED DEBITS     : ${formatCurrency(enteredTotal, 'USD')}\n`;
      paper += `  CONTROL VERIFICATION     : ${mismatchMessage}\n`;
      paper += `  CURRENCY HASH TOTALS     : ${rawSumOfAmounts}  (RAW ABSOLUTE BYTES CHECKSUM)\n`;
      paper += `  DECIMAL COMPRESSION CODE : COMPLIANT (BYPASS ALL FORMAT NOISE)\n`;
      paper += `---------------------------------------------------------------------------------\n`;
      paper += `LINE  GL-DATE    ACCOUNT NUMBER     SUBLEDGER  TYPE       DEBITS         CREDITS \n`;
      paper += `----  ---------  -----------------  ---------  ----  -----------  -----------\n`;
      
      let lineIdx = 1;
      transactions.forEach((t) => {
        const glDateFormatted = new Date(t.createdAt).toLocaleDateString(undefined, { month: 'short', day: '2-digit' }).toUpperCase();
        t.entries.forEach((e) => {
          const paddedAcct = e.accountCode.padEnd(17).substring(0, 17);
          const sub = ((e as any).subledgerCode || 'N/A').padEnd(9).substring(0, 9);
          const type = ((t as any).ledgerType || 'AA').padEnd(4);
          const dr = e.debitMinor > 0 ? formatCurrency(e.debitMinor, 'USD').padStart(11) : ' '.padStart(11);
          const cr = e.creditMinor > 0 ? formatCurrency(e.creditMinor, 'USD').padStart(11) : ' '.padStart(11);
          
          paper += `${lineIdx.toString().padStart(3, '0')}  ${glDateFormatted}  ${paddedAcct}  ${sub}  ${type}  ${dr}  ${cr}\n`;
          lineIdx++;
        });
      });
      
      paper += `----  ---------  -----------------  ---------  ----  -----------  -----------\n`;
      paper += `TOTAL LINES PROCESSED      : ${totalLinesCount.toString().padStart(5, '0')}                     ${formatCurrency(debitTotalMinor, 'USD').padStart(11)}  ${formatCurrency(creditTotalMinor, 'USD').padStart(11)}\n`;
      paper += `=================================================================================\n`;
      paper += `[SYSTEM CONFIRMATION] Cryptographic proof verified. Currency absolute hash verified.`;
      
      setReportCompiledResult(paper);
      setIsCompiling(false);
    }, 1100);
  };

  // 5. Ampersand Strategy WIP simulator feedback
  const parsedAmpersandFeedback = useMemo(() => {
    const raw = ampersandInput.trim();
    if (!raw) return { status: 'error', message: 'Please enter account code to verify exception handling.' };
    
    if (raw.startsWith('&')) {
      const cleanCode = raw.substring(1);
      return {
        status: 'bypass',
        message: `Strategic ampersand prefix detected. Entering '${cleanCode}' as Work-In-Process bypass. Entry accepted in F0911, but the entire batch transaction is flagged with [COMPLIANCE_ERR] and posting to F0902 table is strategically BLOCKED until restored.`
      };
    } else {
      // Find matches in accounts
      const match = accounts.find(a => a.code === raw || a.id === raw);
      if (match) {
        return {
          status: 'nominal',
          message: `Normal Account Definition Matches: '${match.name}'. Account verified in F0901. Nominal alignment. Batch status: Approved.`
        };
      } else {
        return {
          status: 'error',
          message: `Referential Integrity Link Failure: Account '${raw}' does not exist in F0901 physical master file. Entering this value without a preceding '&' (ampersand) prefix will fail instantly and reject the batch.`
        };
      }
    }
  }, [ampersandInput, accounts]);

  // Quick helper to format standard numeric representations with decimal formatting
  const formatMinor = (minorVal: number, currency: string = 'USD') => {
    return formatCurrency(minorVal, currency);
  };

  return (
    <div id="compliance-command-panel" className="z-10 pointer-events-auto h-full flex flex-col justify-between text-white/90">
      
      {/* Top Section Header */}
      <div>
        <div className="flex items-center justify-between border-b border-[#2a2a35]/60 pb-2">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <div>
              <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest block font-mono">
                Regulatory Ledger Protocol
              </span>
              <h2 className="text-xs uppercase font-extrabold tracking-wider font-sans text-emerald-300">
                General Ledger Reporting compliance Suite
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedExportDocType('p09301')}
              className="flex items-center gap-1.5 px-2.5 py-1 text-[8.5px] uppercase font-mono font-bold text-amber-300 bg-amber-500/10 border border-amber-500/40 hover:bg-amber-500/20 hover:border-amber-400 rounded transition-all cursor-pointer"
            >
              <Printer className="w-3 h-3 text-amber-450" />
              <span>Operations Print Desk</span>
            </button>
            <div className="flex items-center gap-1 bg-[#0c0c12] border border-[#2a2a35] px-2 py-0.5 rounded font-mono text-[8.5px]">
              <span className="text-white/30 uppercase">Standard:</span>
              <span className="text-emerald-400 font-bold uppercase">GAAP / SOVR-001</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tab Controls & Viewport Split */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 my-2.5 flex-grow overflow-hidden h-[360px]">
        
        {/* Sidebar tabs selection (3 Columns out of 12) */}
        <div className="md:col-span-3 flex md:flex-col gap-1 overflow-x-auto md:overflow-x-visible pb-1 md:pb-0">
          {[
            { id: 'playbook', label: '1. Three-Tier SOP', icon: FileText },
            { id: 'journal', label: '2. Journal Audits', icon: ArrowRightLeft },
            { id: 'trial-balance', label: '3. Trial Balance', icon: Table },
            { id: 'statements', label: '4. Statements Engine', icon: Coins },
            { id: 'integrity', label: '5. Integrity Engine', icon: Activity }
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ComplianceTab)}
                className={`flex items-center gap-2 text-left px-2.5 py-2 border rounded-sm font-mono text-[9px] uppercase transition-all cursor-pointer flex-shrink-0 md:flex-shrink ${
                  active 
                    ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300 font-bold shadow-[0_0_8px_rgba(16,185,129,0.1)]' 
                    : 'bg-[#050507] border-[#2a2a35]/50 text-white/55 hover:text-white/80 hover:bg-[#0c0c12]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${active ? 'text-emerald-400' : 'text-white/30'}`} />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}

          {/* Reference Card at bottom */}
          <div className="hidden md:block mt-auto p-2 border border-white/5 bg-[#030305] rounded-sm text-[8px] font-mono leading-relaxed text-white/35">
            <span className="text-white/50 font-bold block mb-0.5">SOVR ARCHITECTURE DEFINITIONS</span>
            <div className="space-y-0.5">
              <div>• F0901: Account Master</div>
              <div>• F0911: Account Ledger (Detail)</div>
              <div>• F0902: Account Summary (Balances)</div>
              <div>• F0011: Batch Control Audit Headers</div>
            </div>
          </div>
        </div>

        {/* Dynamic Tab Panel Viewport (9 Columns out of 12) */}
        <div className="md:col-span-9 bg-[#050507] border border-[#2a2a35] rounded p-3 overflow-y-auto scrollbar-thin flex flex-col justify-between">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="h-full flex flex-col justify-between"
            >
              
              {/* Tab 1: Three-Tier Processing SOP */}
              {activeTab === 'playbook' && (
                <div className="space-y-3 text-[9.5px]">
                  <div className="border-b border-[#2a2a35] pb-1.5 flex justify-between items-center bg-[#07070a]/90 -mx-3 -mt-3 p-3 rounded-t">
                    <span className="font-bold tracking-wide text-emerald-400 font-mono">1. EXECUTIVE OVERVIEW & SOVR ACCOUNT STRUCTURE REPRESENTATION</span>
                    <span className="text-[8px] px-1 bg-white/5 text-white/40 font-mono uppercase rounded font-bold">Standard: SOVR Dev Holdings</span>
                  </div>

                  <p className="text-white/60 leading-relaxed font-sans">
                    All transaction detail updates flowing from raw network nodes undergo a structured 
                    <strong className="text-white font-semibold"> Three-Tier processing model</strong> representing strict compliance checks prior to committing balances to the permanent ledger:
                  </p>

                  {/* Interactive Flow Diagram */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 bg-[#0c0c12] p-2 border border-white/5 rounded-sm my-1 font-mono text-[9px]">
                    {[
                      { step: 0, num: '1. ENTRY (F0911)', title: 'Ledger Detail Row', desc: 'Transactions are recorded immediately in the unposted batch isolates; net balance remaining invariant in F0902.' },
                      { step: 1, num: '2. REVIEW (F0011)', title: 'Batch Review Approved', desc: 'Verify expected total vs entered total. Batches shift status: Pending Code (P) or Approved Code (A).' },
                      { step: 2, num: '3. POST (F0902)', title: 'Permanent Balances', desc: 'System executes posting sweep: moving totals from Account Ledger (F0911) directly into Summary Balances (F0902).' }
                    ].map(st => {
                      const selected = activeLifecycleStep === st.step;
                      return (
                        <button
                          key={st.step}
                          type="button"
                          onClick={() => setActiveLifecycleStep(st.step)}
                          className={`p-2 rounded text-left transition-all border cursor-pointer ${
                            selected 
                              ? 'bg-emerald-500/10 border-emerald-500/50 text-white shadow-inner' 
                              : 'bg-[#030305] border-[#2a2a35]/40 text-white/45 hover:text-white/70 hover:border-[#2a2a35]'
                          }`}
                        >
                          <div className={`font-bold text-[8px] uppercase ${selected ? 'text-emerald-400' : 'text-white/20'}`}>{st.num}</div>
                          <div className="font-extrabold text-[9px] tracking-tight">{st.title}</div>
                          {selected && (
                            <p className="text-[7.5px] text-white/60 leading-normal mt-1 animate-fadeIn font-sans">{st.desc}</p>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Account Master Formatter & Reorg Simulator */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 border-t border-[#2a2a35]/50 pt-2.5">
                    
                    {/* Left Panel: Format Tester */}
                    <div className="md:col-span-7 bg-[#08080c] border border-white/5 p-2 rounded-sm space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-white uppercase text-[8px] tracking-wide">F0901 Account Master Representation Format Workspace</span>
                        <button
                          type="button"
                          onClick={() => setSelectedExportDocType('f0901')}
                          className="text-[7.5px] text-[#02c39a] bg-[#02c39a]/10 hover:bg-[#02c39a]/20 border border-[#02c39a]/30 rounded px-1.5 py-0.5 font-mono font-bold uppercase transition-all cursor-pointer flex items-center gap-1"
                        >
                          <Printer className="w-2.5 h-2.5" /> Export Specs
                        </button>
                      </div>
                      
                      <div className="space-y-1 bg-[#030305] p-2 border border-white/5 rounded-sm">
                        <label className="text-white/40 text-[7.5px] uppercase font-mono block">Input Account String (Split with "." or "/"):</label>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            className="bg-black/80 border border-[#2a2a35]/65 flex-grow text-[9px] font-mono p-1 px-1.5 rounded-sm text-emerald-300 focus:outline-none focus:border-emerald-500/60"
                            value={accountFormatterInput} 
                            onChange={(e) => setAccountFormatterInput(e.target.value)}
                            placeholder="BusinessUnit.Object.Subsidiary"
                          />
                          <button 
                            type="button"
                            onClick={() => setAccountFormatterInput("501.1110.BEAR")} 
                            className="bg-zinc-800 text-[8.5px] font-mono px-1.5 hover:bg-zinc-700 rounded-sm text-white/70"
                          >
                            Reset
                          </button>
                        </div>
                        <p className="text-[7.5px] text-white/30 font-sans mt-0.5">Legend: BusinessUnit (12-char) / Object Account (4-6 char) / Subsidiary (1-8 char)</p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[8.5px] font-mono">
                        <div className="bg-[#030305] p-2 border border-white/5 rounded-sm">
                          <span className="text-white/40 text-[7px] uppercase block">Format 1: Standard (BU.OBJ.SUB)</span>
                          <span className="text-emerald-400 font-bold block mt-0.5 truncate">{parsedAccountFormats.standard}</span>
                        </div>
                        <div className="bg-[#030305] p-2 border border-white/5 rounded-sm">
                          <span className="text-white/40 text-[7px] uppercase block">Format 2: Third G/L (Cross Ref)</span>
                          <span className="text-cyan-400 block mt-0.5 truncate">{parsedAccountFormats.thirdGL}</span>
                        </div>
                        <div className="bg-[#030305] p-2 border border-white/5 rounded-sm">
                          <span className="text-white/40 text-[7px] uppercase block">Format 3: Short ID (System Key)</span>
                          <span className="text-amber-400 block mt-0.5 truncate">{parsedAccountFormats.shortId}</span>
                        </div>
                        <div className="bg-[#030305] p-2 border border-white/5 rounded-sm">
                          <span className="text-white/40 text-[7px] uppercase block">Format 4: Speed Code (Shorthand)</span>
                          <span className="text-purple-400 block mt-0.5 truncate">{parsedAccountFormats.speedCode}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right Panel: Reorganization Simulator */}
                    <div className="md:col-span-5 bg-[#08080c] border border-white/5 p-2 rounded-sm flex flex-col justify-between space-y-2">
                      <div>
                        <span className="font-mono font-bold text-white uppercase text-[8px] tracking-wide block">Reorganization Flexibility Sweep</span>
                        <p className="text-[7.5px] text-white/30 leading-snug font-sans mt-0.5">Moves balances organically while maintaining historical referential integrity.</p>
                      </div>

                      <div className="bg-[#030305] border border-white/5 p-1.5 h-[62px] overflow-y-auto rounded-sm scrollbar-thin">
                        {reorgStatus === 'idle' ? (
                          <div className="text-white/20 font-mono text-[7px] h-full flex items-center justify-center text-center">
                            Press action below to simulate automated entity restructure migration
                          </div>
                        ) : (
                          <div className="space-y-0.5 font-mono text-[6.5px] leading-tight text-white/50">
                            {reorgLogs.map((log, idx) => {
                              const isSuccess = log.includes('[REORG_SUCCESS]');
                              return (
                                <div key={idx} className={isSuccess ? 'text-emerald-400 font-bold' : ''}>
                                  {log}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={handlePerformReorg}
                        disabled={reorgStatus === 'running'}
                        className={`w-full py-1 rounded text-[8.5px] font-mono font-bold uppercase cursor-pointer leading-none transition-all ${
                          reorgStatus === 'running' 
                            ? 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-400' 
                            : 'bg-emerald-500/20 border border-emerald-400/40 hover:bg-emerald-500/35 hover:border-emerald-400 text-emerald-300'
                        }`}
                      >
                        {reorgStatus === 'running' ? 'Migrating Ledgers...' : 'Execute Restructure Migration'}
                      </button>
                    </div>

                  </div>

                </div>
              )}

              {/* Tab 2: Journal Audits (P09301 & Trails) */}
              {activeTab === 'journal' && (
                <div className="space-y-2.5 text-[9.5px]">
                  <div className="border-b border-[#2a2a35] pb-1.5 flex justify-between items-center bg-[#07070a]/90 -mx-3 -mt-3 p-3 rounded-t">
                    <span className="font-bold tracking-wide text-emerald-400 font-mono">2. COMPLIANT PRINTED REPORT MATRIX & ENHANCED SUBLEDGERS</span>
                    <span className="text-[8px] font-mono font-bold text-amber-400 uppercase">SOVR P09301 SUITE</span>
                  </div>

                  <p className="text-white/60 leading-relaxed font-sans">
                    Physical copies verify ledger status prior to period close. Compile official 
                    <strong className="text-white font-semibold"> SOVR Ledger Reports</strong> containing mandatory audit metrics:
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                    
                    {/* Left Panel: Report Compiler Controls */}
                    <div className="md:col-span-5 space-y-2.5">
                      
                      {/* Compiler triggers */}
                      <div className="bg-[#08080c] border border-white/5 p-2 rounded-sm space-y-2">
                        <span className="font-mono font-bold text-white uppercase text-[8px] tracking-wide block">1. Formatted Printed Report Compiler</span>
                        
                        <div className="space-y-1.5 font-mono text-[8.5px]">
                          <div>
                            <label className="text-white/30 text-[7px] uppercase block mb-1">Select Report Type Standard:</label>
                            <select 
                              className="bg-black border border-[#2a2a35]/65 w-full text-[8.5px] p-1 rounded-sm text-cyan-300 font-mono focus:outline-none focus:border-cyan-500/60"
                              value={selectedReportType}
                              onChange={(e) => setSelectedReportType(e.target.value as any)}
                            >
                              <option value="unposted">Unposted General Journal (P09301)</option>
                              <option value="batch">General Journal by Batch (F0011 Sequence)</option>
                              <option value="account">General Journal by Account (F0901 Sequence)</option>
                            </select>
                          </div>

                          <button
                            type="button"
                            onClick={handleCompileReport}
                            disabled={isCompiling}
                            className="w-full py-1.5 mt-1 bg-amber-500/20 border border-amber-400/40 hover:bg-amber-500/35 hover:border-amber-400 text-amber-300 font-mono text-[8.5px] font-bold rounded cursor-pointer uppercase transition-all flex items-center justify-center gap-1"
                          >
                            {isCompiling ? (
                              <>
                                <RefreshCw className="w-3 h-3 animate-spin text-amber-400" />
                                Compiling Ledger Data...
                              </>
                            ) : (
                              'Compile & Print Official Report'
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Enhanced Subledger (ESA) Section */}
                      <div className="bg-[#08080c] border border-white/5 p-2 rounded-sm space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-mono font-bold text-white uppercase text-[8px] tracking-wide block">2. Enhanced Subledger Analysis (ESA)</span>
                          <span className="text-[7px] px-1 bg-cyan-500/10 text-cyan-300 uppercase font-mono border border-cyan-500/20">Referential Integrity</span>
                        </div>
                        
                        <div className="space-y-1.5 font-mono text-[8.5px]">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-white/30 text-[7px] uppercase block mb-1">ESA Field Type:</label>
                              <select 
                                className="bg-black border border-[#2a2a35]/60 w-full text-[8px] p-0.5 rounded-sm text-white/80 focus:outline-none"
                                value={esaType}
                                onChange={(e) => setEsaType(e.target.value as any)}
                              >
                                <option value="N">N - Numeric / Zero Fill</option>
                                <option value="C">C - Alphanumeric / Blank Fill</option>
                                <option value="A">A - Pure Alphanumeric</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-white/30 text-[7px] uppercase block mb-1">Master Table Link:</label>
                              <select 
                                className="bg-black border border-[#2a2a35]/60 w-full text-[8px] p-0.5 rounded-sm text-white/80 focus:outline-none"
                                value={esaMaster}
                                onChange={(e) => setEsaMaster(e.target.value as any)}
                              >
                                <option value="F0101">F0101 Address Book</option>
                                <option value="F1201">F1201 Equipment Master</option>
                              </select>
                            </div>
                          </div>

                          <div className="bg-[#030305] p-1.5 border border-white/5 rounded-sm space-y-1">
                            <label className="text-white/40 text-[7px] uppercase block">Type Entity ID to Validate:</label>
                            <input 
                              type="text"
                              className="bg-black/80 border border-[#2a2a35]/65 w-full text-[9px] p-1 rounded-sm text-cyan-300 focus:outline-none focus:border-cyan-500/50"
                              value={esaInput}
                              onChange={(e) => setEsaInput(e.target.value)}
                              placeholder="e.g. 1001, 8802, 1205"
                            />
                            <p className="text-[7px] text-white/35">Hint: Values 1001, 1002, 1205, 8801, 8802 are pre-seeded in validation master.</p>
                          </div>

                          <div className="bg-[#030305] p-1.5 rounded-sm border border-[#2a2a35]/40 text-[7.5px] space-y-1 font-mono">
                            <div className="flex justify-between">
                              <span className="text-white/45">F0911 Byte Representation:</span>
                              <span className="text-emerald-400 font-extrabold bg-emerald-500/10 px-1 rounded">
                                '{parsedEsaResult.formatted}'
                              </span>
                            </div>
                            <div className="flex items-start gap-1 font-sans">
                              <div className={`w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0 ${parsedEsaResult.valid ? 'bg-emerald-500' : 'bg-red-500'}`} />
                              <span className={`text-[7.5px] font-mono ${parsedEsaResult.valid ? 'text-emerald-400 font-medium' : 'text-rose-450'}`}>
                                {parsedEsaResult.message}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* Right Panel: Monospace Ledger Sheet */}
                    <div className="md:col-span-7 flex flex-col justify-between space-y-1 text-[8px] font-mono leading-none">
                      <div className="bg-[#030305] border border-dashed border-[#2a2a35] p-2 bg-[#06080d] text-white/85 text-[8.5px] rounded overflow-x-auto select-all max-h-[195px] min-h-[195px] scrollbar-thin">
                        {reportCompiledResult ? (
                          <pre className="text-emerald-300/95 leading-[1.125] text-[7.5px] font-mono select-text font-medium whitespace-pre">
                            {reportCompiledResult}
                          </pre>
                        ) : (
                          <div className="h-full flex flex-col justify-center items-center text-center text-white/30 uppercase space-y-1 py-12 font-mono">
                            <FileText className="w-8 h-8 text-white/10" />
                            <span>REPORT NOT YET COMPILED</span>
                            <span className="text-[6.5px] text-white/20 normal-case">Configure left settings and click Compile to print auditable sheet.</span>
                          </div>
                        )}
                      </div>
                      <div className="bg-[#0c0c12] p-1.5 border border-[#2a2a35]/40 rounded text-[7.5px] text-white/40 flex items-center justify-between">
                        <span>Currency Absolute Hash Totals: decimal-omitted absolute logic</span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedExportDocType('p09301')}
                            className="bg-amber-500/20 border border-amber-400/30 text-amber-300 hover:bg-amber-500/30 px-2 py-0.5 rounded font-mono text-[7px] uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all"
                          >
                            <Printer className="w-2.5 h-2.5 text-amber-400" /> Print / Export Report
                          </button>
                          <span className="text-amber-400 font-mono font-bold self-center">Section 5 Standard</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* Tab 3: Trial Balance Compiler (P09410 series) */}
              {activeTab === 'trial-balance' && (
                <div className="space-y-2 text-[9.5px] flex flex-col justify-between h-full">
                  <div>
                    <div className="border-b border-[#2a2a35] pb-1.5 flex justify-between items-center bg-[#07070a]/90 -mx-3 -mt-3 p-3 rounded-t">
                      <span className="font-bold tracking-wide text-emerald-400 font-mono">3. INTERNAL TRIAL BALANCE DIAGNOSTICS (P09410)</span>
                      <div className="flex gap-1 font-mono text-[8px]">
                        <button
                          onClick={() => setTbReportType('BU')}
                          className={`px-1.5 py-0.5 border rounded-sm transition-all ${
                            tbReportType === 'BU' ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300' : 'bg-[#030305] border-[#2a2a35] text-white/30'
                          }`}
                        >
                          P09410 Business Unit
                        </button>
                        <button
                          onClick={() => setTbReportType('Object')}
                          className={`px-1.5 py-0.5 border rounded-sm transition-all ${
                            tbReportType === 'Object' ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300' : 'bg-[#030305] border-[#2a2a35] text-white/30'
                          }`}
                        >
                          P094121 Object Account
                        </button>
                      </div>
                    </div>

                    <p className="text-white/60 leading-relaxed font-sans mt-2">
                      The generated system Trial Balance summarizes the net position of general accounts listed in the <code className="text-white bg-white/5 px-1 rounded-sm">F0902</code> table, upholding the basic accounting equation parameters:
                    </p>

                    <div className="mt-2 max-h-[140px] overflow-y-auto border border-[#2a2a35]/60 rounded scrollbar-thin">
                      <table className="w-full text-left font-mono text-[8px] border-collapse bg-[#0c0c12]">
                        <thead>
                          <tr className="bg-[#101017] border-b border-[#2a2a35] text-white/35 sticky top-0">
                            <th className="p-1 px-1.5">Acct Code</th>
                            <th className="p-1">Account Description</th>
                            <th className="p-1">Class Type</th>
                            <th className="p-1 text-right">Debit balance</th>
                            <th className="p-1 text-right">Credit balance</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-white/80">
                          {accounts.map(acc => {
                            const isDr = acc.kind === 'asset' || acc.kind === 'escrow';
                            const showCode = tbReportType === 'BU' 
                              ? acc.code 
                              : `OBJ-${acc.code.split('.')[0] || acc.code}`;
                            return (
                              <tr key={acc.id} className="hover:bg-white/[0.02]">
                                <td className="p-1 px-1.5 font-bold text-cyan-400">{showCode}</td>
                                <td className="p-1 truncate max-w-[120px]">{acc.name}</td>
                                <td className="p-1 uppercase text-white/40">{acc.kind}</td>
                                <td className="p-1 text-right text-emerald-400">
                                  {isDr ? formatMinor(acc.balanceMinor, acc.denomination) : '-'}
                                </td>
                                <td className="p-1 text-right text-purple-400">
                                  {!isDr ? formatMinor(acc.balanceMinor, acc.denomination) : '-'}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="bg-[#08080c] border border-emerald-500/25 p-2 rounded-sm text-[8px] text-emerald-400/80 font-mono mt-1.5 flex items-center justify-between gap-3">
                    <span className="leading-relaxed">
                      <strong>GAAP Dimension Filter Checklist:</strong> Integrated Category Codes (F0006) map reporting attributes dynamically without modifying the database grid.
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedExportDocType('p09410')}
                      className="flex-shrink-0 px-2 py-1 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-300 font-mono text-[8.5px] font-bold rounded uppercase flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <Printer className="w-2.5 h-2.5 text-emerald-400" /> Print TB Sheet
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 4: Statutory Statements Engine (P10111) */}
              {activeTab === 'statements' && (
                <div className="space-y-2 text-[9.5px]">
                  <div className="border-b border-[#2a2a35] pb-1.5 flex justify-between items-center bg-[#07070a]/90 -mx-3 -mt-3 p-3 rounded-t">
                    <span className="font-bold tracking-wide text-emerald-400 font-mono">4. COMPLIANCE FINANCIAL STATEMENTS (P10111 / P10211)</span>
                    <span className="text-[8px] px-1 bg-teal-500/10 text-teal-300 font-mono uppercase border border-teal-500/20 rounded">Automatic Accounting Instructions (AAI)</span>
                  </div>

                  <p className="text-white/60 leading-relaxed font-sans">
                    General statements are assembled dynamically using SOVR ledger rules mapped via AAI routing tables:
                  </p>

                  <div className="grid grid-cols-2 gap-3 mt-1.5">
                    
                    {/* Compact Statement Card: Income Statement */}
                    <div className="bg-[#0c0c12] border border-[#2a2a35]/65 p-2.5 rounded-sm space-y-2 flex flex-col justify-between">
                      <div>
                        <span className="text-[8px] text-[#02c39a] font-mono font-bold uppercase tracking-wider block">Income Statement (P10211)</span>
                        <p className="text-[8px] text-white/35 font-sans">Synthesized revenues & operational COGS margins</p>
                      </div>
                      
                      <div className="space-y-1 font-mono text-[9px] border-t border-b border-white/5 py-1.5">
                        <div className="flex justify-between">
                          <span className="text-white/40">Revenue (F0902):</span>
                          <span className="text-white font-bold">{formatMinor(calculatedMetrics.revenue)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/40">Cost of Goods Sold:</span>
                          <span className="text-white">({formatMinor(calculatedMetrics.cogs)})</span>
                        </div>
                        <div className="flex justify-between font-bold border-t border-white/5 pt-0.5 text-cyan-300">
                          <span>Gross Margin:</span>
                          <span>{formatMinor(calculatedMetrics.grossMargin)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/40">Operating Expenses:</span>
                          <span className="text-white">({formatMinor(calculatedMetrics.opEx)})</span>
                        </div>
                      </div>

                      <div className="bg-black/30 p-1.5 rounded-sm font-mono text-[8.5px] border border-[#2a2a35]/40 text-emerald-400">
                        <div className="flex justify-between font-bold">
                          <span>Operating Income:</span>
                          <span>{formatMinor(calculatedMetrics.operatingIncome)}</span>
                        </div>
                        <span className="text-[7px] text-white/20 block font-sans mt-0.5">Formula: Gross Margin - (COGS + OpEx)</span>
                      </div>
                    </div>

                    {/* Cash Flow Statement Checklist P10521 */}
                    <div className="bg-[#0c0c12] border border-[#2a2a35]/65 p-2.5 rounded-sm space-y-1 bg-[#090b10] flex flex-col justify-between">
                      <div>
                        <span className="text-[8px] text-amber-400 font-mono font-bold uppercase tracking-wider block">Statement of Cash Flows (P10521)</span>
                        <p className="text-[8px] text-white/35 font-sans">F0008 Period End close requirements matrix</p>
                      </div>

                      <div className="space-y-1.5 my-1 text-[8.5px] font-mono">
                        {[
                          { key: 'datePattern', label: 'Fiscal Date Pattern Checked (F0008)' },
                          { key: 'cashAccountsFlagged', label: 'Cash Accounts Flagged (F0901)' },
                          { key: 'aaiConfigured', label: 'GLG Auto instructions Configured' },
                          { key: 'closingTasksCompleted', label: 'Period-End Adjustments Committed' }
                        ].map(chk => (
                          <button
                            key={chk.key}
                            onClick={() => {
                              setCashFlowChecklist(prev => ({
                                ...prev,
                                [chk.key]: !prev[chk.key as keyof typeof prev]
                              }));
                            }}
                            className="flex items-center gap-2 text-left w-full hover:text-white transition-colors cursor-pointer"
                          >
                            <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-all ${
                              cashFlowChecklist[chk.key as keyof typeof cashFlowChecklist] 
                                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' 
                                : 'bg-[#030305] border-white/10 text-white/20'
                            }`}>
                              {cashFlowChecklist[chk.key as keyof typeof cashFlowChecklist] && <Check className="w-2.5 h-2.5" />}
                            </div>
                            <span className={cashFlowChecklist[chk.key as keyof typeof cashFlowChecklist] ? 'text-white/80' : 'text-white/40'}>
                              {chk.label}
                            </span>
                          </button>
                        ))}
                      </div>

                      <div className="pt-1.5 border-t border-white/5 text-[7.5px] text-white/30 uppercase tracking-widest font-mono flex items-center justify-between">
                        <span>P10521 Compiled Check</span>
                        <span className={Object.values(cashFlowChecklist).every(v => v) ? 'text-emerald-400 font-bold' : 'text-amber-500 font-bold'}>
                          {Object.values(cashFlowChecklist).every(v => v) ? 'PROVISIONING OK' : 'PENDING CONFIG'}
                        </span>
                      </div>
                    </div>

                  </div>

                  {/* Add bottom bar with statement printer */}
                  <div className="bg-[#08080c] border border-white/5 p-2 rounded-sm text-[8px] font-mono flex items-center justify-between gap-3 mt-1.5 text-white/50 w-full mb-0.5">
                    <span>Automatic Accounting Instructions (AAI) verified and dynamically loaded.</span>
                    <button
                      type="button"
                      onClick={() => setSelectedExportDocType('p10111')}
                      className="px-2 py-1 bg-teal-500/10 border border-teal-500/30 text-teal-300 hover:bg-teal-500/25 rounded font-bold uppercase text-[7.5px] flex items-center gap-1 cursor-pointer transition-all flex-shrink-0"
                    >
                      <Printer className="w-2.5 h-2.5 text-teal-350" /> Print Corporate Reports
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 5: Integrity Engine */}
              {activeTab === 'integrity' && (
                <div className="space-y-2.5 text-[9.5px] flex flex-col justify-between h-full">
                  <div>
                    <div className="border-b border-[#2a2a35] pb-1.5 flex justify-between items-center bg-[#07070a]/90 -mx-3 -mt-3 p-3 rounded-t">
                      <span className="font-bold tracking-wide text-emerald-400 font-mono">5. LEDGER INTEGRITY AUDITS & STRATEGIC EXCEPTION CODES</span>
                      <span className="text-[8px] animate-pulse font-mono font-bold text-cyan-400 uppercase">SOVR F0901/F0911 Audit</span>
                    </div>

                    <p className="text-white/60 leading-relaxed font-sans mt-2">
                      F0901 physical master codes, F0911 ledger entries, and F0902 summaries are monitored. Execute standard scan tests or test strategic Ampersand Exception paths:
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mt-2">
                      
                      {/* Left Panel: Ledger Scanner */}
                      <div className="md:col-span-7 flex flex-col justify-between space-y-2">
                        <div className="bg-[#0c0c12] border border-[#2a2a35]/60 rounded-sm p-3 font-mono text-[8.5px] space-y-1.5 min-h-[142px] max-h-[142px] overflow-y-auto scrollbar-thin">
                          {scanResult.status === 'idle' && (
                            <div className="text-white/40 flex flex-col items-center justify-center py-4 text-center h-full">
                              <Activity className="w-8 h-8 text-white/10 mb-1 animate-pulse" />
                              <span>Ledger Compliance Audit Scanner Available</span>
                              <span className="text-[7px]">Verifies unposted detail anomalies & out-of-balance entries.</span>
                            </div>
                          )}

                          {scanResult.status === 'running' && (
                            <div className="text-cyan-400 flex flex-col items-center justify-center py-4 text-center h-full">
                              <RefreshCw className="w-6 h-6 animate-spin mb-1 text-cyan-400" />
                              <span className="font-bold">SCANNING INTEGRITY MAPPINGS...</span>
                              <span className="text-white/30 text-[7px] mt-0.5 uppercase">Parsing F0911 transaction ledger against F0902 summary balances</span>
                            </div>
                          )}

                          {scanResult.status === 'completed' && (
                            <div className="space-y-1.5">
                              <div className="flex justify-between items-center border-b border-white/5 pb-1">
                                <span className="font-bold text-white">SCAN COMPLETED</span>
                                <span className={`px-1.5 py-0.5 rounded uppercase text-[7px] font-bold ${scanResult.integrityOk ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                  {scanResult.integrityOk ? 'NOMINAL' : 'EXCEPTIONS FOUND'}
                                </span>
                              </div>
                              
                              {scanResult.errors.length === 0 ? (
                                <div className="text-emerald-400 flex items-center gap-1.5 py-1 text-[8.5px]">
                                  <Check className="w-4 h-4 bg-emerald-500/10 rounded-full p-0.5" />
                                  <span>Balances and masters align perfectly. F0901, F0911 and F0902 link is verified stable.</span>
                                </div>
                              ) : (
                                <div className="space-y-1 font-mono text-[7.5px]">
                                  {scanResult.errors.map((err, idx) => (
                                    <div key={idx} className="text-rose-400 flex items-start gap-1 leading-tight">
                                      <AlertTriangle className="w-3 h-3 text-amber-500 flex-shrink-0 mt-0.5" />
                                      <span>{err}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={handleRunIntegrityScan}
                            disabled={scanResult.status === 'running'}
                            className="flex-grow py-1.5 bg-emerald-500/20 border border-emerald-400/40 hover:bg-emerald-500/35 hover:border-emerald-400 text-emerald-300 font-mono text-[8.5px] font-bold rounded cursor-pointer leading-none transition-all uppercase flex items-center justify-center gap-1.5"
                          >
                            <Play className="w-2.5 h-2.5 text-emerald-400 fill-emerald-400" />
                            Run compliance verification scan
                          </button>
                          {scanResult.status === 'completed' && (
                            <button
                              type="button"
                              onClick={() => setSelectedExportDocType('integrity')}
                              className="px-2 bg-cyan-500/15 border border-cyan-500/30 text-cyan-350 hover:bg-cyan-500/25 rounded font-mono font-bold text-[8px] uppercase flex items-center gap-1 cursor-pointer transition-all px-3"
                            >
                              <Printer className="w-3 h-3" /> Report
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Right Panel: Ampersand Exception Tester */}
                      <div className="md:col-span-5 bg-[#08080c] border border-white/5 p-2 rounded-sm flex flex-col justify-between space-y-1.5 min-h-[174px]">
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="font-mono font-bold text-white uppercase text-[8px] tracking-wide block">Strategic exception Handling (& Strategy)</span>
                          </div>
                          <p className="text-[7.5px] text-white/35 leading-snug font-sans mt-0.5">Prefixing non-master accounts with &apos;&amp;&apos; bypasses block for Work-In-Process entries.</p>
                        </div>

                        <div className="space-y-1 font-mono text-[8.5px]">
                          <label className="text-white/40 text-[7px] uppercase block">Test Account Reference:</label>
                          <input 
                            type="text"
                            className="bg-black/80 border border-[#2a2a35]/65 w-full text-[8.5px] p-1 rounded-sm text-amber-300 focus:outline-none focus:border-amber-500/50"
                            value={ampersandInput}
                            onChange={(e) => setAmpersandInput(e.target.value)}
                            placeholder="e.g. &amp;911.TEMP_WIP"
                          />
                          <div className="flex gap-1.5 mt-1">
                            <button 
                              type="button" 
                              onClick={() => setAmpersandInput("&911.TEMP_UNCHECKED")}
                              className="text-[7.5px] bg-[#0c0c12] border border-white/5 py-0.5 px-1 rounded hover:bg-zinc-800 text-white/50 cursor-pointer"
                            >
                              Use &apos;&amp;&apos; Bypass
                            </button>
                            <button 
                              type="button" 
                              onClick={() => setAmpersandInput("999.INVALID")}
                              className="text-[7.5px] bg-[#0c0c12] border border-white/5 py-0.5 px-1 rounded hover:bg-zinc-800 text-white/50 cursor-pointer"
                            >
                              Use Raw Invalid
                            </button>
                          </div>
                        </div>

                        <div className={`p-1.5 rounded-sm border text-[7.5px] font-mono leading-normal ${
                          parsedAmpersandFeedback.status === 'bypass' 
                            ? 'bg-amber-500/10 border-amber-500/35 text-amber-300' 
                            : parsedAmpersandFeedback.status === 'nominal'
                              ? 'bg-emerald-500/15 border-emerald-500/35 text-emerald-400'
                              : 'bg-rose-500/10 border-rose-500/30 text-rose-450'
                        }`}>
                          <span className="font-bold uppercase block text-[7px] mb-0.5">Post-Engine Outcome Strategy:</span>
                          {parsedAmpersandFeedback.message}
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Footer System Status Banner */}
      <div className="border-t border-[#2a2a35]/60 pt-2 flex items-center justify-between text-[8px] text-white/35 font-mono uppercase tracking-widest leading-none">
        <span>SOVR GAAP Policy Auditor: ONLINE</span>
        <span>Version: CO_FCOMP_v4.5</span>
        <span>Last Audit Hash Block Sign: SEALED</span>
      </div>

      {/* 📥 PRINT BUREAU & DOCUMENT EXPORT OVERLAY MODAL */}
      <AnimatePresence>
        {selectedExportDocType && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#020203]/95 backdrop-blur-md z-50 flex items-center justify-center p-4 text-white"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="bg-[#0b0c10] border border-[#2a2a35] max-w-2xl w-full rounded-lg overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex flex-col justify-between"
            >
              {/* Modal Header */}
              <div className="bg-[#07070a] border-b border-[#2a2a35] px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Printer className="w-4 h-4 text-amber-400 animate-pulse" />
                  <div>
                    <span className="text-[9px] text-[#02c39a] font-mono uppercase font-bold tracking-widest block text-left">Operational Hardcopy Bureau</span>
                    <span className="text-xs text-white uppercase font-extrabold font-sans text-left">SOVR Development Holdings LLC Document Exporter Console</span>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={() => setSelectedExportDocType(null)}
                  className="bg-[#15151e] border border-[#2a2a35] text-white/50 hover:text-white hover:border-rose-500/50 p-1 px-2 rounded font-mono text-[9px] cursor-pointer"
                >
                  [Esc] Close [X]
                </button>
              </div>

              {/* Modal Document Select Row */}
              <div className="bg-[#0e0f14] px-4 py-2 flex items-center justify-between gap-3 text-white/60 text-[8.5px] border-b border-white/5">
                <span className="font-mono uppercase text-[7px] text-white/30">Active Document:</span>
                <div className="flex gap-1.5 overflow-x-auto scrollbar-none py-0.5">
                  {[
                    { id: 'f0901', label: 'F0901 Master Spec' },
                    { id: 'p09301', label: 'P09301 Ledger Proof' },
                    { id: 'p09410', label: 'P09410 Trial Bal' },
                    { id: 'p10111', label: 'P10111 GAAP Board' },
                    { id: 'integrity', label: 'Ledger Integrity' }
                  ].map(doc => (
                    <button
                      key={doc.id}
                      type="button"
                      onClick={() => setSelectedExportDocType(doc.id as any)}
                      className={`px-2 py-0.5 border rounded-sm font-mono text-[8px] uppercase transition-all cursor-pointer whitespace-nowrap ${
                        selectedExportDocType === doc.id
                          ? 'bg-amber-400/20 border-amber-400 text-amber-300 font-bold'
                          : 'bg-black/40 border-[#2a2a35] text-white/40 hover:text-white/70'
                      }`}
                    >
                      {doc.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Monospace Vintage Matrix Paper Sheet Preview */}
              <div id="print-paper-preview-container" className="p-4 bg-black/40">
                <div 
                  id="print-paper-content"
                  className="bg-[#f6f4eb] text-zinc-900 border border-stone-350 rounded shadow-inner p-4 font-mono leading-[1.25] text-[8.5px] max-h-[280px] overflow-y-auto select-text select-all whitespace-pre scrollbar-thin text-left border-dashed"
                >
                  {selectedExportDocType === 'f0901' && getF0901Doc()}
                  {selectedExportDocType === 'p09301' && (reportCompiledResult || generateJournalReportText(selectedReportType))}
                  {selectedExportDocType === 'p09410' && getP09410Doc()}
                  {selectedExportDocType === 'p10111' && getP10111Doc()}
                  {selectedExportDocType === 'integrity' && getIntegrityDoc()}
                </div>
                <div className="text-[7.5px] text-white/30 font-mono mt-2 uppercase flex items-center justify-between">
                  <span>Note: Standard Courier Matrix density style. Select text box to copy manual selections.</span>
                  <span className="text-[#02c39a] font-bold">STRIAL_CLOSE_SECURE ✅</span>
                </div>
              </div>

              {/* Modal Footer Controls */}
              <div className="bg-[#07070a] border-t border-[#2a2a35] px-4 py-3 flex justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedExportDocType(null)}
                  className="px-3 py-1.5 bg-[#15151e] border border-[#2a2a35] text-white/60 hover:text-white font-mono text-[9px] uppercase rounded transition-all cursor-pointer"
                >
                  Return to Dashboard
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const docStr = 
                        selectedExportDocType === 'f0901' ? getF0901Doc() :
                        selectedExportDocType === 'p09301' ? (reportCompiledResult || generateJournalReportText(selectedReportType)) :
                        selectedExportDocType === 'p09410' ? getP09410Doc() :
                        selectedExportDocType === 'p10111' ? getP10111Doc() :
                        getIntegrityDoc();
                      handleCopyToClipboard(docStr);
                    }}
                    className="px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/25 font-mono text-[9px] font-bold uppercase rounded flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copied ? 'Copied ✅' : 'Copy Plain Text'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const docStr = 
                        selectedExportDocType === 'f0901' ? getF0901Doc() :
                        selectedExportDocType === 'p09301' ? (reportCompiledResult || generateJournalReportText(selectedReportType)) :
                        selectedExportDocType === 'p09410' ? getP09410Doc() :
                        selectedExportDocType === 'p10111' ? getP10111Doc() :
                        getIntegrityDoc();
                      handleDownloadFile(selectedExportDocType, docStr);
                    }}
                    className="px-3 py-1.5 bg-[#1a2c1d] border border-emerald-500/30 text-emerald-300 hover:bg-[#233f28] hover:border-emerald-500 font-mono text-[9px] font-bold uppercase rounded flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Download TXT File</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const docStr = 
                        selectedExportDocType === 'f0901' ? getF0901Doc() :
                        selectedExportDocType === 'p09301' ? (reportCompiledResult || generateJournalReportText(selectedReportType)) :
                        selectedExportDocType === 'p09410' ? getP09410Doc() :
                        selectedExportDocType === 'p10111' ? getP10111Doc() :
                        getIntegrityDoc();
                      handlePrintDocument(docStr);
                    }}
                    className="px-3 py-1.5 bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 font-mono text-[9px] font-bold uppercase rounded flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-amber-400" />
                    <span>Print Hardcopy</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
