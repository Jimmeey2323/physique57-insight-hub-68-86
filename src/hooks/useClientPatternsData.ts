import { useState, useEffect } from 'react';

export interface ClientPatternsData {
  dataSource: string;
  dataType: string;
  sessionId: string;
  sessionName: string;
  sessionType: string;
  sessionStart: string;
  sessionEnd: string;
  teacherName: string;
  locationName: string;
  inPerson: boolean;
  isLateCancelled: boolean;
  isCancelledAfterCutOff: boolean;
  isCancelled: boolean;
  sessionPaid: number;
  isFromMobileApp: boolean;
  checkInAt: string;
  targetMemberId: string;
  targetMemberName: string;
  memberId: string;
  hostId: string;
  memberName: string;
  memberEmail: string;
  subscriptionPackageId: string;
  membershipPackageName: string;
  membershipSubscriptionType: string;
  type: string;
  startDate: string;
  endDate: string;
  isFrozen: boolean;
  cancellationReason: string;
  cancellationReasonType: string;
  totalClasses: number;
  classesLeft: number;
  totalMoney: number;
  moneyLeft: number;
  enforceStartDate: boolean;
  membershipActivateOnFirstUse: boolean;
  isComplementary: boolean;
  isFreeTrial: boolean;
  usedSessionsSystem: number;
  usedAppointments: number;
  usedCombined: number;
  usedMoneyCredits: number;
  usedEventCredits: number;
  usageLimitForSessions: number;
  hasUsageLimits: boolean;
  totalSessionsBooked: number;
  cancelledSessionsCount: number;
  lateCancelledSessionsCount: number;
  attendedSessionsCount: number;
  noShowCount: number;
  priceCalculationMethodology: string;
  totalAmountPaid: number;
  pricePerSessionBooked: number;
  pricePerSessionAttended: number;
  pricePerSessionUtilized: number;
  pricePerProjectedSession: number;
  membershipLengthDays: number;
  elapsedDays: number;
  remainingDays: number;
  bookingVelocity: number;
  projectedTotalSessions: number;
  projectedFinalCostPerSession: number;
  membershipUtilizationRate: number;
  attendanceEfficiencyRate: number;
  cancellationRate: number;
  lateCancellationRate: number;
  attendanceRate: number;
  overallUtilizationScore: number;
  valueRealizationScore: number;
  membershipStatus: string;
  daysUntilExpiry: number;
  avgSessionsPerWeek: number;
  sessionBookingPattern: string;
  memberEngagementLevel: string;
  churnRiskAssessment: string;
  paymentTransactionId: string;
  paymentTransactionItemId: string;
  unitPriceInMoneyCredits: number;
  unitPriceInEventCredits: number;
  saleItemCurrency: string;
  paymentMethod: string;
  isProrated: boolean;
  paid: number;
  refunded: number;
  isVoided: boolean;
  createdAt: string;
  createdByUserName: string;
  seriesIndex: number;
  saleItemId: string;
  selectedDynamicPrice: string;
  typeField: string;
}

const GOOGLE_CONFIG = {
  CLIENT_ID: "416630995185-g7b0fm679lb4p45p5lou070cqscaalaf.apps.googleusercontent.com",
  CLIENT_SECRET: "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",
  REFRESH_TOKEN: "1//0gT2uoYBlNdGXCgYIARAAGBASNwF-L9IrBK_ijYwpce6-TdqDfji4GxYuc4uxIBKasdgoZBPm-tu_EU0xS34cNirqfLgXbJ8_NMk",
  TOKEN_URL: "https://oauth2.googleapis.com/token"
};

const SPREADSHEET_ID = "1W58l0h8wl8aWK5OjiEiRS1AXMQ_zaYVFq9RkmC_Mdw0";

export const useClientPatternsData = () => {
  const [data, setData] = useState<ClientPatternsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getAccessToken = async () => {
    try {
      const response = await fetch(GOOGLE_CONFIG.TOKEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: GOOGLE_CONFIG.CLIENT_ID,
          client_secret: GOOGLE_CONFIG.CLIENT_SECRET,
          refresh_token: GOOGLE_CONFIG.REFRESH_TOKEN,
          grant_type: 'refresh_token',
        }),
      });

      const tokenData = await response.json();
      return tokenData.access_token;
    } catch (error) {
      console.error('Error getting access token:', error);
      throw error;
    }
  };

  const parseNumericValue = (value: string | number): number => {
    if (typeof value === 'number') return value;
    if (!value || value === '') return 0;
    
    const cleaned = value.toString().replace(/,/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  };

  const parseBooleanValue = (value: string | boolean): boolean => {
    if (typeof value === 'boolean') return value;
    if (!value || value === '') return false;
    return value.toString().toLowerCase() === 'true';
  };

  const fetchClientPatternsData = async () => {
    try {
      setLoading(true);
      const accessToken = await getAccessToken();
      
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Sessions?alt=json`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch client patterns data');
      }

      const result = await response.json();
      const rows = result.values || [];
      
      if (rows.length < 2) {
        setData([]);
        return;
      }

      const clientPatternsData: ClientPatternsData[] = rows.slice(1).map((row: any[]) => {
        return {
          dataSource: row[0] || '',
          dataType: row[1] || '',
          sessionId: row[2] || '',
          sessionName: row[3] || '',
          sessionType: row[4] || '',
          sessionStart: row[5] || '',
          sessionEnd: row[6] || '',
          teacherName: row[7] || '',
          locationName: row[8] || '',
          inPerson: parseBooleanValue(row[9]),
          isLateCancelled: parseBooleanValue(row[10]),
          isCancelledAfterCutOff: parseBooleanValue(row[11]),
          isCancelled: parseBooleanValue(row[12]),
          sessionPaid: parseNumericValue(row[13]),
          isFromMobileApp: parseBooleanValue(row[14]),
          checkInAt: row[15] || '',
          targetMemberId: row[16] || '',
          targetMemberName: row[17] || '',
          memberId: row[18] || '',
          hostId: row[19] || '',
          memberName: row[20] || '',
          memberEmail: row[21] || '',
          subscriptionPackageId: row[22] || '',
          membershipPackageName: row[23] || '',
          membershipSubscriptionType: row[24] || '',
          type: row[25] || '',
          startDate: row[26] || '',
          endDate: row[27] || '',
          isFrozen: parseBooleanValue(row[28]),
          cancellationReason: row[29] || '',
          cancellationReasonType: row[30] || '',
          totalClasses: parseNumericValue(row[31]),
          classesLeft: parseNumericValue(row[32]),
          totalMoney: parseNumericValue(row[33]),
          moneyLeft: parseNumericValue(row[34]),
          enforceStartDate: parseBooleanValue(row[35]),
          membershipActivateOnFirstUse: parseBooleanValue(row[36]),
          isComplementary: parseBooleanValue(row[37]),
          isFreeTrial: parseBooleanValue(row[38]),
          usedSessionsSystem: parseNumericValue(row[39]),
          usedAppointments: parseNumericValue(row[40]),
          usedCombined: parseNumericValue(row[41]),
          usedMoneyCredits: parseNumericValue(row[42]),
          usedEventCredits: parseNumericValue(row[43]),
          usageLimitForSessions: parseNumericValue(row[44]),
          hasUsageLimits: parseBooleanValue(row[45]),
          totalSessionsBooked: parseNumericValue(row[46]),
          cancelledSessionsCount: parseNumericValue(row[47]),
          lateCancelledSessionsCount: parseNumericValue(row[48]),
          attendedSessionsCount: parseNumericValue(row[49]),
          noShowCount: parseNumericValue(row[50]),
          priceCalculationMethodology: row[51] || '',
          totalAmountPaid: parseNumericValue(row[52]),
          pricePerSessionBooked: parseNumericValue(row[53]),
          pricePerSessionAttended: parseNumericValue(row[54]),
          pricePerSessionUtilized: parseNumericValue(row[55]),
          pricePerProjectedSession: parseNumericValue(row[56]),
          membershipLengthDays: parseNumericValue(row[57]),
          elapsedDays: parseNumericValue(row[58]),
          remainingDays: parseNumericValue(row[59]),
          bookingVelocity: parseNumericValue(row[60]),
          projectedTotalSessions: parseNumericValue(row[61]),
          projectedFinalCostPerSession: parseNumericValue(row[62]),
          membershipUtilizationRate: parseNumericValue(row[63]),
          attendanceEfficiencyRate: parseNumericValue(row[64]),
          cancellationRate: parseNumericValue(row[65]),
          lateCancellationRate: parseNumericValue(row[66]),
          attendanceRate: parseNumericValue(row[67]),
          overallUtilizationScore: parseNumericValue(row[68]),
          valueRealizationScore: parseNumericValue(row[69]),
          membershipStatus: row[70] || '',
          daysUntilExpiry: parseNumericValue(row[71]),
          avgSessionsPerWeek: parseNumericValue(row[72]),
          sessionBookingPattern: row[73] || '',
          memberEngagementLevel: row[74] || '',
          churnRiskAssessment: row[75] || '',
          paymentTransactionId: row[76] || '',
          paymentTransactionItemId: row[77] || '',
          unitPriceInMoneyCredits: parseNumericValue(row[78]),
          unitPriceInEventCredits: parseNumericValue(row[79]),
          saleItemCurrency: row[80] || '',
          paymentMethod: row[81] || '',
          isProrated: parseBooleanValue(row[82]),
          paid: parseNumericValue(row[83]),
          refunded: parseNumericValue(row[84]),
          isVoided: parseBooleanValue(row[85]),
          createdAt: row[86] || '',
          createdByUserName: row[87] || '',
          seriesIndex: parseNumericValue(row[88]),
          saleItemId: row[89] || '',
          selectedDynamicPrice: row[90] || '',
          typeField: row[91] || '',
        };
      });

      setData(clientPatternsData);
      setError(null);
    } catch (err) {
      console.error('Error fetching client patterns data:', err);
      setError('Failed to load client patterns data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientPatternsData();
  }, []);

  return { data, loading, error, refetch: fetchClientPatternsData };
};