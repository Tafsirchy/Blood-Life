export interface DistrictData {
  id: string;
  nameEn: string;
  nameBn: string;
  division: string;
  upazilas: string[];
}

export const DIVISIONS = [
  { id: "dhaka", nameEn: "Dhaka", nameBn: "ঢাকা" },
  { id: "chittagong", nameEn: "Chittagong", nameBn: "চট্টগ্রাম" },
  { id: "rajshahi", nameEn: "Rajshahi", nameBn: "রাজশাহী" },
  { id: "khulna", nameEn: "Khulna", nameBn: "খুলনা" },
  { id: "barishal", nameEn: "Barishal", nameBn: "বরিশাল" },
  { id: "sylhet", nameEn: "Sylhet", nameBn: "সিলেট" },
  { id: "rangpur", nameEn: "Rangpur", nameBn: "রংপুর" },
  { id: "mymensingh", nameEn: "Mymensingh", nameBn: "ময়মনসিংহ" },
];

export const DISTRICTS: DistrictData[] = [
  // Dhaka Division
  { id: "dhaka", nameEn: "Dhaka", nameBn: "ঢাকা", division: "Dhaka", upazilas: ["Dhanmondi", "Mirpur", "Uttara", "Mohammadpur", "Gulshan", "Badda", "Tejgaon", "Savar", "Keraniganj"] },
  { id: "gazipur", nameEn: "Gazipur", nameBn: "গাজীপুর", division: "Dhaka", upazilas: ["Sadar", "Kaliakair", "Kapasia", "Sreepur", "Kaliganj"] },
  { id: "narayanganj", nameEn: "Narayanganj", nameBn: "নারায়ণগঞ্জ", division: "Dhaka", upazilas: ["Sadar", "Araihazar", "Bandar", "Rupganj", "Sonargaon"] },
  { id: "tangail", nameEn: "Tangail", nameBn: "টাঙ্গাইল", division: "Dhaka", upazilas: ["Sadar", "Mirzapur", "Ghatail", "Madhupur", "Sakhipur"] },
  { id: "faridpur", nameEn: "Faridpur", nameBn: "ফরিদপুর", division: "Dhaka", upazilas: ["Sadar", "Boalmari", "Bhanga", "Nagarkanda"] },
  { id: "manikganj", nameEn: "Manikganj", nameBn: "মানিকগঞ্জ", division: "Dhaka", upazilas: ["Sadar", "Singair", "Saturia", "Shibalaya"] },
  { id: "munshiganj", nameEn: "Munshiganj", nameBn: "মুন্সিগঞ্জ", division: "Dhaka", upazilas: ["Sadar", "Gajaria", "Tongibari", "Sirajdikhan"] },
  { id: "narsingdi", nameEn: "Narsingdi", nameBn: "নরসিংদী", division: "Dhaka", upazilas: ["Sadar", "Raipura", "Shibpur", "Monohardi"] },
  { id: "gopalganj", nameEn: "Gopalganj", nameBn: "গোপালগঞ্জ", division: "Dhaka", upazilas: ["Sadar", "Kashiani", "Kotalipara", "Tungipara"] },
  { id: "madaripur", nameEn: "Madaripur", nameBn: "মাদারীপুর", division: "Dhaka", upazilas: ["Sadar", "Kalkini", "Rajoir", "Shibchar"] },
  { id: "rajbari", nameEn: "Rajbari", nameBn: "রাজবাড়ী", division: "Dhaka", upazilas: ["Sadar", "Goalanda", "Pangsha", "Baliakandi"] },
  { id: "shariatpur", nameEn: "Shariatpur", nameBn: "শরীয়তপুর", division: "Dhaka", upazilas: ["Sadar", "Zajira", "Bhedarganj", "Damudya"] },
  { id: "kishoreganj", nameEn: "Kishoreganj", nameBn: "কিশোরগঞ্জ", division: "Dhaka", upazilas: ["Sadar", "Bajitpur", "Bhairab", "Katiadi"] },

  // Chittagong Division
  { id: "chittagong", nameEn: "Chittagong", nameBn: "চট্টগ্রাম", division: "Chittagong", upazilas: ["Kotwali", "Panchlaish", "Pahartali", "Hathazari", "Sitakunda", "Patiya", "Raozan"] },
  { id: "coxs-bazar", nameEn: "Cox's Bazar", nameBn: "কক্সবাজার", division: "Chittagong", upazilas: ["Sadar", "Chakaria", "Teknaf", "Ukhia", "Ramu"] },
  { id: "comilla", nameEn: "Comilla", nameBn: "কুমিল্লা", division: "Chittagong", upazilas: ["Adarsha Sadar", "Debidwar", "Daudkandi", "Chandina", "Laksam"] },
  { id: "brahmanbaria", nameEn: "Brahmanbaria", nameBn: "ব্রাহ্মণবাড়িয়া", division: "Chittagong", upazilas: ["Sadar", "Ashuganj", "Sarail", "Nabinagar"] },
  { id: "chandpur", nameEn: "Chandpur", nameBn: "চাঁদপুর", division: "Chittagong", upazilas: ["Sadar", "Hajiganj", "Matlab", "Shahrasti"] },
  { id: "feni", nameEn: "Feni", nameBn: "ফেনী", division: "Chittagong", upazilas: ["Sadar", "Daganbhuiyan", "Chhagalnaiya", "Parshuram"] },
  { id: "noakhali", nameEn: "Noakhali", nameBn: "নোয়াখালী", division: "Chittagong", upazilas: ["Sadar", "Begumganj", "Chatkhil", "Senbagh"] },
  { id: "lakshmipur", nameEn: "Lakshmipur", nameBn: "লক্ষ্মীপুর", division: "Chittagong", upazilas: ["Sadar", "Raipur", "Ramganj", "Ramgati"] },
  { id: "khagrachhari", nameEn: "Khagrachhari", nameBn: "খাগড়াছড়ি", division: "Chittagong", upazilas: ["Sadar", "Dighinala", "Panchhari", "Matiranga"] },
  { id: "rangamati", nameEn: "Rangamati", nameBn: "রাঙ্গামাটি", division: "Chittagong", upazilas: ["Sadar", "Kaptai", "Baghaichhari", "Langadu"] },
  { id: "bandarban", nameEn: "Bandarban", nameBn: "বান্দরবান", division: "Chittagong", upazilas: ["Sadar", "Ruma", "Thanchi", "Lama"] },

  // Rajshahi Division
  { id: "rajshahi", nameEn: "Rajshahi", nameBn: "রাজশাহী", division: "Rajshahi", upazilas: ["Boalia", "Motihar", "Paba", "Godagari", "Bagmara"] },
  { id: "bogra", nameEn: "Bogra", nameBn: "বগুড়া", division: "Rajshahi", upazilas: ["Sadar", "Sherpur", "Shibganj", "Gabtali"] },
  { id: "pabna", nameEn: "Pabna", nameBn: "পাবনা", division: "Rajshahi", upazilas: ["Sadar", "Ishwardi", "Santhia", "Chatmohar"] },
  { id: "sirajganj", nameEn: "Sirajganj", nameBn: "সিরাজগঞ্জ", division: "Rajshahi", upazilas: ["Sadar", "Shahjadpur", "Ullapara", "Belkuchi"] },
  { id: "naogaon", nameEn: "Naogaon", nameBn: "নওগাঁ", division: "Rajshahi", upazilas: ["Sadar", "Patnitala", "Dhamoirhat", "Manda"] },
  { id: "natore", nameEn: "Natore", nameBn: "নাটোর", division: "Rajshahi", upazilas: ["Sadar", "Singra", "Baraigram", "Lalpur"] },
  { id: "chapainawabganj", nameEn: "Chapainawabganj", nameBn: "চাঁপাইনবাবগঞ্জ", division: "Rajshahi", upazilas: ["Sadar", "Shibganj", "Gomastapur"] },
  { id: "joypurhat", nameEn: "Joypurhat", nameBn: "জয়পুরহাট", division: "Rajshahi", upazilas: ["Sadar", "Panchbibi", "Kalai", "Khetlal"] },

  // Khulna Division
  { id: "khulna", nameEn: "Khulna", nameBn: "খুলনা", division: "Khulna", upazilas: ["Sadar", "Sonadanga", "Daulatpur", "Dumuria", "Rupsha"] },
  { id: "jessore", nameEn: "Jessore", nameBn: "যশোর", division: "Khulna", upazilas: ["Sadar", "Jhikargachha", "Manirampur", "Abhaynagar"] },
  { id: "kushtia", nameEn: "Kushtia", nameBn: "কুষ্টিয়া", division: "Khulna", upazilas: ["Sadar", "Kumarkhali", "Bheramara", "Mirpur"] },
  { id: "satkhira", nameEn: "Satkhira", nameBn: "সাতক্ষীরা", division: "Khulna", upazilas: ["Sadar", "Tala", "Kaliganj", "Shyamnagar"] },
  { id: "bagerhat", nameEn: "Bagerhat", nameBn: "বাগেরহাট", division: "Khulna", upazilas: ["Sadar", "Mongla", "Morrelganj", "Rampal"] },
  { id: "chuadanga", nameEn: "Chuadanga", nameBn: "চুয়াডাঙ্গা", division: "Khulna", upazilas: ["Sadar", "Alamdanga", "Damurhuda", "Jibannagar"] },
  { id: "jhenaidah", nameEn: "Jhenaidah", nameBn: "ঝিনাইদহ", division: "Khulna", upazilas: ["Sadar", "Kaliganj", "Shailkupa", "Kotchandpur"] },
  { id: "magura", nameEn: "Magura", nameBn: "মাগুরা", division: "Khulna", upazilas: ["Sadar", "Sreepur", "Mohammadpur", "Shalikha"] },
  { id: "meherpur", nameEn: "Meherpur", nameBn: "মেহেরপুর", division: "Khulna", upazilas: ["Sadar", "Gangni", "Mujibnagar"] },
  { id: "narail", nameEn: "Narail", nameBn: "নড়াইল", division: "Khulna", upazilas: ["Sadar", "Lohagara", "Kalia"] },

  // Sylhet Division
  { id: "sylhet", nameEn: "Sylhet", nameBn: "সিলেট", division: "Sylhet", upazilas: ["Kotwali", "South Surma", "Beanibazar", "Golapganj", "Osmani Nagar"] },
  { id: "moulvibazar", nameEn: "Moulvibazar", nameBn: "মৌলভীবাজার", division: "Sylhet", upazilas: ["Sadar", "Sreemangal", "Kulaura", "Barlekha"] },
  { id: "habiganj", nameEn: "Habiganj", nameBn: "হবিগঞ্জ", division: "Sylhet", upazilas: ["Sadar", "Madhabpur", "Nabiganj", "Bahubal"] },
  { id: "sunamganj", nameEn: "Sunamganj", nameBn: "সুনামগঞ্জ", division: "Sylhet", upazilas: ["Sadar", "Chhatak", "Jagannathpur", "Tahirpur"] },

  // Barishal Division
  { id: "barishal", nameEn: "Barishal", nameBn: "বরিশাল", division: "Barishal", upazilas: ["Sadar", "Babuganj", "Bakerganj", "Banaripara", "Gournadi"] },
  { id: "bhola", nameEn: "Bhola", nameBn: "ভোলা", division: "Barishal", upazilas: ["Sadar", "Borhanuddin", "Char Fasson", "Lalmohan"] },
  { id: "patuakhali", nameEn: "Patuakhali", nameBn: "পটুয়াখালী", division: "Barishal", upazilas: ["Sadar", "Galachipa", "Kalapara", "Bauphal"] },
  { id: "pirojpur", nameEn: "Pirojpur", nameBn: "পিরোজপুর", division: "Barishal", upazilas: ["Sadar", "Bhandaria", "Mathbaria", "Nazirpur"] },
  { id: "barguna", nameEn: "Barguna", nameBn: "বরগুনা", division: "Barishal", upazilas: ["Sadar", "Amtali", "Patharghata", "Betagi"] },
  { id: "jhalokati", nameEn: "Jhalokati", nameBn: "ঝালকাঠি", division: "Barishal", upazilas: ["Sadar", "Rajapur", "Nalchity", "Kathalia"] },

  // Rangpur Division
  { id: "rangpur", nameEn: "Rangpur", nameBn: "রংপুর", division: "Rangpur", upazilas: ["Sadar", "Badarganj", "Mithapukur", "Pirganj", "Kaunia"] },
  { id: "dinajpur", nameEn: "Dinajpur", nameBn: "দিনাজপুর", division: "Rangpur", upazilas: ["Sadar", "Birganj", "Parbatipur", "Fulbari"] },
  { id: "gaibandha", nameEn: "Gaibandha", nameBn: "গাইবান্ধা", division: "Rangpur", upazilas: ["Sadar", "Gobindaganj", "Palashbari", "Sundarganj"] },
  { id: "kurigram", nameEn: "Kurigram", nameBn: "কুড়িগ্রাম", division: "Rangpur", upazilas: ["Sadar", "Nageshwari", "Bhurungamari", "Ulipur"] },
  { id: "lalmonirhat", nameEn: "Lalmonirhat", nameBn: "লালমনিরহাট", division: "Rangpur", upazilas: ["Sadar", "Aditmari", "Kaliganj", "Hatibandha"] },
  { id: "nilphamari", nameEn: "Nilphamari", nameBn: "নীলফামারী", division: "Rangpur", upazilas: ["Sadar", "Saidpur", "Jaldhaka", "Domar"] },
  { id: "panchagarh", nameEn: "Panchagarh", nameBn: "পঞ্চগড়", division: "Rangpur", upazilas: ["Sadar", "Boda", "Debiganj", "Tetulia"] },
  { id: "thakurgaon", nameEn: "Thakurgaon", nameBn: "ঠাকুরগাঁও", division: "Rangpur", upazilas: ["Sadar", "Pirganj", "Ranisankail", "Baliadangi"] },

  // Mymensingh Division
  { id: "mymensingh", nameEn: "Mymensingh", nameBn: "ময়মনসিংহ", division: "Mymensingh", upazilas: ["Sadar", "Muktagachha", "Bhaluka", "Trishal", "Gafargaon"] },
  { id: "jamalpur", nameEn: "Jamalpur", nameBn: "জামালপুর", division: "Mymensingh", upazilas: ["Sadar", "Sarishabari", "Melandaha", "Dewanganj"] },
  { id: "netrokona", nameEn: "Netrokona", nameBn: "নেত্রকোণা", division: "Mymensingh", upazilas: ["Sadar", "Kendua", "Mohanganj", "Durgapur"] },
  { id: "sherpur", nameEn: "Sherpur", nameBn: "শেরপুর", division: "Mymensingh", upazilas: ["Sadar", "Nalitabari", "Nakla", "Sreebardi"] },
];

import divisionsJson from "./data/divisions.json";
import districtsJson from "./data/districts.json";
import upazilasJson from "./data/upazilas.json";
import unionsJson from "./data/unions.json";

export interface BDGeoItem {
  id: string;
  name: string;
  bn_name: string;
}

export interface BDDistrictItem extends BDGeoItem {
  division_id: string;
}

export interface BDUpazilaItem extends BDGeoItem {
  district_id: string;
}

export interface BDUnionItem extends BDGeoItem {
  upazila_id: string;
}

export const BD_DIVISIONS: BDGeoItem[] = divisionsJson;
export const BD_DISTRICTS: BDDistrictItem[] = districtsJson;
export const BD_UPAZILAS: BDUpazilaItem[] = upazilasJson;
export const BD_UNIONS: BDUnionItem[] = unionsJson;

export function getDistrictsForDivision(divisionIdOrName: string): BDDistrictItem[] {
  const div = BD_DIVISIONS.find(
    (d) =>
      d.id === divisionIdOrName ||
      d.name.toLowerCase() === divisionIdOrName.toLowerCase() ||
      d.bn_name === divisionIdOrName
  );
  if (!div) return [];
  return BD_DISTRICTS.filter((d) => d.division_id === div.id);
}

export function getUpazilasForDistrict(districtIdOrName: string): BDUpazilaItem[] {
  const dist = BD_DISTRICTS.find(
    (d) =>
      d.id === districtIdOrName ||
      d.name.toLowerCase() === districtIdOrName.toLowerCase() ||
      d.bn_name === districtIdOrName
  );
  if (!dist) return [];
  return BD_UPAZILAS.filter((u) => u.district_id === dist.id);
}

export function getUnionsForUpazila(upazilaIdOrName: string): BDUnionItem[] {
  const up = BD_UPAZILAS.find(
    (u) =>
      u.id === upazilaIdOrName ||
      u.name.toLowerCase() === upazilaIdOrName.toLowerCase() ||
      u.bn_name === upazilaIdOrName
  );
  if (!up) return [];
  const matches = BD_UNIONS.filter((un) => un.upazila_id === up.id);
  if (matches.length > 0) return matches;

  return [
    { id: `${up.id}-ward1`, upazila_id: up.id, name: "Sadar / Ward 01", bn_name: "সদর / ওয়ার্ড ০১" },
    { id: `${up.id}-ward2`, upazila_id: up.id, name: "Central / Main Area", bn_name: "মূল শহর / এলাকা" },
  ];
}

const SPELLING_SYNONYMS: Record<string, string[]> = {
  chittagong: ["Chittagong", "Chattogram", "চট্টগ্রাম"],
  chattogram: ["Chittagong", "Chattogram", "চট্টগ্রাম"],
  barishal: ["Barishal", "Barisal", "বরিশাল"],
  barisal: ["Barishal", "Barisal", "বরিশাল"],
  comilla: ["Comilla", "Cumilla", "কুমিল্লা"],
  cumilla: ["Comilla", "Cumilla", "কুমিল্লা"],
  bogra: ["Bogra", "Bogura", "বগুড়া"],
  bogura: ["Bogra", "Bogura", "বগুড়া"],
  jessore: ["Jessore", "Jashore", "যশোর"],
  jashore: ["Jessore", "Jashore", "যশোর"],
};

/**
 * Returns all known bilingual/spelling aliases (English, Bangla, ID, spelling variants)
 * for a given division, district, or upazila name.
 */
export function getLocationAliases(
  level: "division" | "district" | "upazila",
  input?: string | null
): string[] {
  const raw = (input || "").trim();
  if (!raw || raw.toLowerCase() === "all") return [];

  const aliases = new Set<string>([raw]);
  const lower = raw.toLowerCase();

  if (SPELLING_SYNONYMS[lower]) {
    SPELLING_SYNONYMS[lower].forEach((s) => aliases.add(s));
  }

  if (level === "division") {
    const d1 = DIVISIONS.find(
      (d) => d.id.toLowerCase() === lower || d.nameEn.toLowerCase() === lower || d.nameBn === raw
    );
    if (d1) {
      aliases.add(d1.id);
      aliases.add(d1.nameEn);
      aliases.add(d1.nameBn);
    }
    const d2 = BD_DIVISIONS.find(
      (d) => d.id === raw || d.name.toLowerCase() === lower || d.bn_name === raw
    );
    if (d2) {
      aliases.add(d2.name);
      aliases.add(d2.bn_name);
    }
  } else if (level === "district") {
    const d1 = DISTRICTS.find(
      (d) => d.id.toLowerCase() === lower || d.nameEn.toLowerCase() === lower || d.nameBn === raw
    );
    if (d1) {
      aliases.add(d1.id);
      aliases.add(d1.nameEn);
      aliases.add(d1.nameBn);
    }
    const d2 = BD_DISTRICTS.find(
      (d) => d.id === raw || d.name.toLowerCase() === lower || d.bn_name === raw
    );
    if (d2) {
      aliases.add(d2.name);
      aliases.add(d2.bn_name);
    }
  } else {
    const u = BD_UPAZILAS.find(
      (item) => item.id === raw || item.name.toLowerCase() === lower || item.bn_name === raw
    );
    if (u) {
      aliases.add(u.name);
      aliases.add(u.bn_name);
    }
  }

  return Array.from(aliases).filter(Boolean);
}

/**
 * Resolves the parent division name (English) for a district name or ID.
 */
export function resolveDivisionForDistrict(districtInput?: string | null): string | null {
  const raw = (districtInput || "").trim();
  if (!raw) return null;
  const lower = raw.toLowerCase();

  const d1 = DISTRICTS.find(
    (d) => d.id.toLowerCase() === lower || d.nameEn.toLowerCase() === lower || d.nameBn === raw
  );
  if (d1) return d1.division;

  const d2 = BD_DISTRICTS.find(
    (d) => d.id === raw || d.name.toLowerCase() === lower || d.bn_name === raw
  );
  if (d2) {
    const div = BD_DIVISIONS.find((dv) => dv.id === d2.division_id);
    if (div) return div.name;
  }

  return null;
}


