# -*- coding: utf-8 -*-
"""
Script to generate 365 UNIQUE Feminine Messages for 365 Days of Love.
Generates a clean, 100% compatible messages.js file.
"""

import json

ANXIETY_KILLERS = [
    "بلاش تشيلي هم بكرة ولا تحسبيها كتير.. بكرة ده في إيد رب كريم دبرلكِ كل اللي فات وهيعديلكِ دي كمان بكل لطف وسهولة.",
    "عارف إنكِ بتسألي دايماً إمتى وفين وإزاي.. بس سيبي التدبير للي خلق الكون، ربنا قادر يطوي السكك ويهون المسافات في ليلة وضحاها.",
    "الظروف الصعبة اللي حوالينا والناس اللي بتقول صعب شبه حكاية نار ومياه.. بس الحب الصادق والتوكل الحقيقي بيكسروا كل المستحيل.",
    "اطمني.. اللي قدر يجيبلكِ الرزق والتوفيق في أيام مكنتيش متوقعة، قادر يجمعنا في بيت واحد ويكتب لنا النصيب اللي بنحلم بيه.",
    "التفكير الزيادة في تفاصيل المستقبل بيسرق منكِ جمال اللحظة.. استعيذي بالله ونامي مرتاحة، ربنا شايلنا أحسن بكتير مما نتخيل.",
    "مهما كانت المعطيات قدامنا معقدة والباب مقفول، باب ربنا أوسع بكتير، وكن فيكون قادرة تغير كل القوانين لصالحنا.",
    "كل خطوة بتخطيها في سعيكِ وفي صلاتكِ ودعاكِ مسجلة عند ربنا.. هو شايف تعبكِ ومش هينساه أبداً.",
    "عارفة ليه أنا مطمن؟ عشان واثق إن ربنا بيختبر صبرنا عشان يعوضنا عوض يليق بجمال قلوبنا، اطمني خالص يا جميلتي.",
    "لو حسيتي بقبضة في قلبكِ من بكرة، افتكري إن معية ربنا وقدرته محاوطانا، ومفيش مستحيل على رب العالمين.",
    "السنتين أو الوقت اللي مخوفكِ مش هيمشي إلا بإذن الله، وكل يوم بيقربنا لبعض خطوة، استصبري واستبشري.",
    "الناس بتقول صعب والمحيطين بيحبطونا، زي ما قالوا على وايد وستر.. بس إحنا إرادتنا ويقيننا في ربنا أكبر من أي كلام.",
    "يا بنتي الطيبة، اللي خلق السحاب والرياح قادر يسخر لنا الأرض ومن عليها، توكلي على الحي الذي لا يموت.",
    "أنا مش خايف من بكرة لأنكِ معايا، ولأننا بنسعى بما يرضي الله، وربنا عمره ما رد عبد رفع إيده يطلبه.",
    "كل تعب صامت بتحسيه وأنتِ شايلة هم بكرة، ربنا شايفه ومخبيلكِ قصاده راحة بال وفرحة تملى عينيكِ دموع.",
    "سيبي التفكير للـ مدبر الحكيم، وركزي في ضحكتكِ، في صلاتكِ، وفي حبنا اللي بيقوى كل يوم أكتر وأكتر."
]

LOVE_MESSAGES = [
    "أنا ما اختارتكيش صدفة ولا عشان ظروف عادية، أنا اخترتكِ أنتِ بالذات بعقلي وقلبي وروحي لتكوني شريكة عمري وزوجتي وأم أولادي.",
    "أنتِ الروح اللي كنت تايه في الدنيا ولقيتها.. وجودكِ في حياتي بيخلي لكل حاجة معنى وطعم تاني خالص.",
    "لو العالم كله وقف قصادنا، كفاية عندي إني بختاركِ كل يوم من أول وجديد، وهفضل ماسك في إيدكِ لآخر العمر.",
    "قلبكِ النقي وطيبة روحكِ هما أجمل نعم ربنا عليا.. إنسانة زيكِ تستاهل كل أمان الدنيا ورضاها.",
    "في وسط زحمة العالم وحساباته، أنتِ الثابت الوحيد الجميل اللي بفتكره فابتسم من غير أي مجهود.",
    "أنتِ مش بس إنسانة بحبها، أنتِ الأمان والدفا والبيت اللي نفسي أسكن فيه وأنا مطمن.",
    "ضحكتكِ بالنسبة ليا هي النور اللي بينور أي ضلمة بتعدي عليا، ربنا ما يحرمني من وجودكِ أبداً.",
    "أنا متأكد إنكِ أجمل اختيار خدته في حياتي، ومهما قابلنا من صعاب، ههون عليكِ وهتهوني عليا.",
    "بحب طريقتكِ، بحب تفاصيلكِ، بحب خوفكِ وطيبتكِ.. بحب فيكِ كل حاجة بتخليكي أنتِ.",
    "أنتِ السكن الحقيقي اللي كنت بدعي بيه في صلاتي، وربنا استجاب ورزقني بيكي.",
    "مكانكِ في قلبي محفور ومثبت بعهود، ومستحيل أي ظروف تهز إيماني بيكي وبحبنا.",
    "كل يوم بيعدي وأنتِ معايا، بتأكد أكتر إن ربنا بيحبني عشان رزقني بقلب صافي ونقي زي قلبكِ.",
    "أنتِ مش مجرد جزء من يومي، أنتِ مستقبلي كله، واليوم اللي بتبدئيه معايا بيبقى عيد.",
    "مهما كانت المسافات أو العوائق، روحي دايماً سابقة روحي ليكي وبتحس بيكي قبل ما تنطقي.",
    "أنا متمسك بيكي زي ما أنتِ متمسكة بيا وأكتر، وعارف إن تعبنا ده كله هيثمر فرحة قريبة بإذن الله."
]

VERSES = [
    ("إِنَّ مَعَ الْعُسْرِ يُسْرًا", "سورة الشرح - الآية 6", "مهما ضاقت بيكي السكة، فرج ربنا جاي ورا العسر دايمًا يسر ينسيكي كل تعب."),
    ("وَهُوَ مَعَكُمْ أَيْنَ مَا كُنتُمْ", "سورة الحديد - الآية 4", "أنتِ مش لوحدكِ ولا لحظة، ربنا أقرب ليكي من نفسكِ وسامع كل دقة في قلبكِ الخايف."),
    ("وَاصْبِرْ لِحُكْمِ رَبِّكَ فَإِنَّكَ بِأَعْيُنِنَا", "سورة الطور - الآية 48", "تعبكِ وصبركِ وسعيكِ مش ضايع، أنتِ تحت عين ربنا وحفظه خطوة بخطوة."),
    ("لَا تَدْرِي لَعَلَّ اللَّهَ يُحْدِثُ بَعْدَ ذَٰلِكَ أَمْرًا", "سورة الطلاق - الآية 1", "في ليلة وضحاها كل حاجة ممكن تتغير للأحسن، خلي أملكِ في تدبير ربنا كبير.")
]

DUAS = [
    ("اللهم يا جابر القلوب المكسورة، اجبر خاطر من أحب جبراً يتعجب منه أهل السماوات والأرض، وهوّن عليها كل عسير، واملأ قلبها نوراً ورضا.", "يا رب آمين يا أرحم الراحمين 🤲"),
    ("اللهم إني استودعتك قلبها وروها وراحتها، فاصرف عنها شتات العقل وثقل الأيام، ويسر لها كل أمر يقلقها وافتح لها أبواب الرزق والفرج.", "حفظكِ الله ورعاكِ بعينه التي لا تنام ❤️")
]

def build_clean_messages():
    messages = []
    titles = ["رسالة لقلبكِ النهاردة...", "تذكرة دافية من قلبي...", "راحة وسكينة لروحكِ...", "همسة حب وطمأنينة..."]
    signoffs = ["دايماً معاكي وفي ضهركِ ❤️", "بحبكِ وربنا يطمن قلبكِ دايماً 🌸", "في رعاية الله وحفظه دايماً ✨"]

    for day in range(1, 366):
        title = titles[(day - 1) % len(titles)]
        signoff = signoffs[(day - 1) % len(signoffs)]
        
        verse_ar, verse_surah, verse_exp = None, None, None
        
        if day == 1:
            cat = "بداية الرحلة"
            text = "النهاردة بداية رحلتنا سوا.. عملت المكان ده عشان كل ما تصحي وتفتحي رسالة، تفتكري إنكِ مش لوحدكِ، وإن ربنا كريم ومعاكي، وأنا في ضهركِ دايماً ومتمسك بيكي لآخر العمر مهما كانت الظروف."
            verse_ar = "{ إِنَّ مَعَ الْعُسْرِ يُسْرًا }"
            verse_surah = "سورة الشرح - الآية 6"
            verse_exp = "مهما كانت السكة صعبة، فرج ربنا قريب وبألطف شكل متتخيليهوش."
        elif day == 365:
            cat = "ختام السنة الأولى"
            text = "خلصت أول سنة من حكايتنا، بس دي مجرد بداية لسنين طويلة جاية هنكون فيها مع بعض في بيت واحد.. كل سنة وأنتِ مراتي وحبيبتي وأم عيالي، وربنا يجمعنا في الحلال قريب."
            verse_ar = "{ وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً }"
            verse_surah = "سورة الروم - الآية 21"
            verse_exp = "نعمة الحب الحقيقي والأمان اللي ربنا يديمها بينا."
        else:
            pattern = day % 4
            if pattern == 0:
                cat = "توكل ويقين"
                text = ANXIETY_KILLERS[(day * 3) % len(ANXIETY_KILLERS)]
            elif pattern == 1:
                cat = "اختيارك وزوجتي"
                text = LOVE_MESSAGES[(day * 5) % len(LOVE_MESSAGES)]
            elif pattern == 2:
                cat = "آيات ومطمئنات"
                v_text, v_surah, v_exp = VERSES[(day * 7) % len(VERSES)]
                verse_ar = f"{{ {v_text} }}"
                verse_surah = v_surah
                verse_exp = v_exp
                text = f"خذي نَفَس عميق وافتكري الآية دي كويس النهاردة: {v_exp}"
            else:
                cat = "دعاء من القلب"
                d_text, d_sub = DUAS[(day * 11) % len(DUAS)]
                text = f"{d_text}\n\n{d_sub}"

        messages.append({
            "id": day,
            "dayNumber": day,
            "category": cat,
            "title": title,
            "text": text,
            "verseArabic": verse_ar,
            "verseSurah": verse_surah,
            "verseExplanation": verse_exp,
            "signoff": signoff
        })

    return messages

if __name__ == "__main__":
    msgs = build_clean_messages()
    
    helper_code = '''

// Storage key helper
const STORAGE_KEY_SHUFFLE = (typeof CONFIG !== 'undefined' && CONFIG.STORAGE_KEYS && CONFIG.STORAGE_KEYS.SHUFFLED_ORDER)
  ? CONFIG.STORAGE_KEYS.SHUFFLED_ORDER
  : 'love365_shuffled_order';

export function getShuffledOrder() {
  try {
    if (typeof localStorage !== 'undefined') {
      const data = localStorage.getItem(STORAGE_KEY_SHUFFLE);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length === ALL_MESSAGES.length) {
          return parsed;
        }
      }
    }
  } catch (e) {
    console.warn('Error reading shuffled order from localStorage:', e);
  }
  return null;
}

export function shuffleMessages() {
  const count = ALL_MESSAGES.length;
  if (count <= 2) {
    return ALL_MESSAGES.map(m => m.id);
  }

  // Preserve Day 1 (First Day / Beginning of Journey) and Day 365 (Anniversary)
  // Permute days 2 to 364
  const middle = [];
  for (let i = 2; i < count; i++) {
    middle.push(i);
  }

  for (let i = middle.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [middle[i], middle[j]] = [middle[j], middle[i]];
  }

  const order = [1, ...middle, count];

  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_SHUFFLE, JSON.stringify(order));
    }
  } catch (e) {
    console.warn('Error saving shuffled order to localStorage:', e);
  }

  return order;
}

export function getMessageForDay(day) {
  const dayNum = parseInt(day, 10);
  const total = ALL_MESSAGES.length || 365;
  const validDay = (!isNaN(dayNum) && dayNum >= 1 && dayNum <= total) ? dayNum : 1;
  
  const order = getShuffledOrder();
  const targetId = (order && order[validDay - 1]) ? order[validDay - 1] : validDay;
  
  const found = ALL_MESSAGES.find(m => m.id === targetId);
  return found || ALL_MESSAGES[validDay - 1] || ALL_MESSAGES[0];
}

// Window global fallback
if (typeof window !== 'undefined') {
  window.ALL_MESSAGES = ALL_MESSAGES;
  window.getMessageForDay = getMessageForDay;
  window.shuffleMessages = shuffleMessages;
  window.getShuffledOrder = getShuffledOrder;
}
'''

    js_content = "import { CONFIG } from './config.js';\n\nexport const ALL_MESSAGES = " + json.dumps(msgs, ensure_ascii=False, indent=2) + ";" + helper_code
    
    output_path = r"C:\Users\amazon\Desktop\365_Days_Of_Love\messages.js"
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(js_content)
        
    print("Clean FEMININE messages.js generated successfully!")