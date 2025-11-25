
import { CalendarType, Gender, Pillar, BaziChart } from "../types";

// Declaration for the global Lunar object loaded via CDN
declare const Lunar: any;
declare const Solar: any;

/**
 * Maps Chinese element/stem/branch characters to our ElementType-like colors/names for UI.
 */
const getElementColorType = (char: string): string => {
    const wood = ['甲', '乙', '寅', '卯'];
    const fire = ['丙', '丁', '巳', '午'];
    const earth = ['戊', '己', '辰', '戌', '丑', '未'];
    const metal = ['庚', '辛', '申', '酉'];
    const water = ['壬', '癸', '子', '亥'];

    if (wood.includes(char)) return 'Wood (木)';
    if (fire.includes(char)) return 'Fire (火)';
    if (earth.includes(char)) return 'Earth (土)';
    if (metal.includes(char)) return 'Metal (金)';
    if (water.includes(char)) return 'Water (水)';
    return 'Unknown';
};

/**
 * Calculates the Four Pillars deterministically using lunar-javascript.
 * 
 * FIX: Uses fromYmdHms to correctly initialize time-based pillars (Hour Pillar)
 * and removes the invalid 'setTime' call that was causing crashes.
 */
export const calculateBaziLocal = (
    dateStr: string, // YYYY-MM-DD
    timeStr: string, // HH:mm
    gender: Gender,
    calendarType: CalendarType
): BaziChart => {
    // Safety check: Ensure the library from index.html is loaded
    const w = window as any;
    if (!w.Lunar || !w.Solar) {
        throw new Error("核心算法库未加载，请检查网络或刷新页面");
    }

    if (!dateStr || !timeStr) {
        throw new Error("请完整填写出生日期和时间");
    }

    // 1. Parse Input
    const [year, month, day] = dateStr.split('-').map(n => parseInt(n, 10));
    const [hour, minute] = timeStr.split(':').map(n => parseInt(n, 10));

    if (isNaN(year) || isNaN(month) || isNaN(day)) {
        throw new Error("日期格式无效");
    }

    let solar;
    let lunar;

    try {
        // 2. Convert to Lunar/Solar objects WITH TIME
        // Using fromYmdHms ensures the Hour Pillar is calculated correctly immediately.
        if (calendarType === CalendarType.LUNAR) {
            // Assume non-leap month for simplicity in this UI version
            lunar = w.Lunar.fromYmdHms(year, month, day, hour, minute, 0);
            solar = lunar.getSolar();
        } else {
            solar = w.Solar.fromYmdHms(year, month, day, hour, minute, 0);
            lunar = solar.getLunar();
        }

        // 3. Get Eight Char (BaZi) object
        const bazi = lunar.getEightChar();
        
        // NOTE: Previous crash was caused by bazi.setTime() which does not exist in this library version.
        // Since we initialized Lunar/Solar with Hms, the bazi object already has the correct time.

        // 4. Construct Pillar Objects
        const createPillar = (gan: string, zhi: string): Pillar => {
            const animals = ['鼠','牛','虎','兔','龙','蛇','马','羊','猴','鸡','狗','猪'];
            const zhiOrder = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
            const idx = zhiOrder.indexOf(zhi);
            const animal = idx > -1 ? animals[idx] : '';

            return {
                gan,
                zhi,
                element: getElementColorType(gan),
                animal
            };
        };

        const yearPillar = createPillar(bazi.getYearGan(), bazi.getYearZhi());
        const monthPillar = createPillar(bazi.getMonthGan(), bazi.getMonthZhi());
        const dayPillar = createPillar(bazi.getDayGan(), bazi.getDayZhi());
        const hourPillar = createPillar(bazi.getTimeGan(), bazi.getTimeZhi());

        return {
            year: yearPillar,
            month: monthPillar,
            day: dayPillar,
            hour: hourPillar,
            dayMaster: bazi.getDayGan(),
            dayMasterElement: getElementColorType(bazi.getDayGan()).split(' ')[1].replace(')', ''),
            zodiac: yearPillar.animal,
            // These will be filled by AI interpretation
            strength: '',
            structure: '',
            favorableElements: [],
            unfavorableElements: [],
            missingElements: [],
            luckyColors: [],
            luckyNumbers: [],
            fiveElements: []
        };
    } catch (e: any) {
        console.error("Bazi Calculation Error:", e);
        throw new Error("排盘计算失败: " + e.message);
    }
};
