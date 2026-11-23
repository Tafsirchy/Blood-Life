import { NextRequest, NextResponse } from "next/server";
import divisionsData from "@/lib/geo/data/divisions.json";
import districtsData from "@/lib/geo/data/districts.json";
import upazilasData from "@/lib/geo/data/upazilas.json";
import unionsData from "@/lib/geo/data/unions.json";

export interface GeoItem {
  id: string;
  name: string;
  bn_name: string;
}

export interface DistrictGeoItem extends GeoItem {
  division_id: string;
}

export interface UpazilaGeoItem extends GeoItem {
  district_id: string;
}

export interface UnionGeoItem extends GeoItem {
  upazila_id: string;
}

/**
 * Bangladesh Geo API (Based on ifahimreza/bangladesh-geojson)
 * Serves cached, bilingual Division -> District -> Upazila/Thana -> Union/Area hierarchy.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "divisions";
    const divisionId = searchParams.get("division_id");
    const divisionName = searchParams.get("division_name");
    const districtId = searchParams.get("district_id");
    const districtName = searchParams.get("district_name");
    const upazilaId = searchParams.get("upazila_id");
    const upazilaName = searchParams.get("upazila_name");

    const headers = {
      "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
      "Content-Type": "application/json",
    };

    // 1. Divisions
    if (type === "divisions") {
      return NextResponse.json({ success: true, count: divisionsData.length, data: divisionsData }, { headers });
    }

    // 2. Districts (optionally filtered by division_id or division_name)
    if (type === "districts") {
      let filtered = districtsData as DistrictGeoItem[];

      if (divisionId) {
        filtered = filtered.filter((d) => d.division_id === divisionId);
      } else if (divisionName) {
        const divMatch = (divisionsData as GeoItem[]).find(
          (d) => d.name.toLowerCase() === divisionName.toLowerCase() || d.bn_name === divisionName
        );
        if (divMatch) {
          filtered = filtered.filter((d) => d.division_id === divMatch.id);
        }
      }

      return NextResponse.json({ success: true, count: filtered.length, data: filtered }, { headers });
    }

    // 3. Upazilas / Thanas (optionally filtered by district_id or district_name)
    if (type === "upazilas") {
      let filtered = upazilasData as UpazilaGeoItem[];

      if (districtId) {
        filtered = filtered.filter((u) => u.district_id === districtId);
      } else if (districtName) {
        const distMatch = (districtsData as DistrictGeoItem[]).find(
          (d) => d.name.toLowerCase() === districtName.toLowerCase() || d.bn_name === districtName
        );
        if (distMatch) {
          filtered = filtered.filter((u) => u.district_id === distMatch.id);
        }
      }

      return NextResponse.json({ success: true, count: filtered.length, data: filtered }, { headers });
    }

    // 4. Unions / Wards (filtered by upazila_id or upazila_name)
    if (type === "unions") {
      let targetUpazilaId = upazilaId;

      if (!targetUpazilaId && upazilaName) {
        const upMatch = (upazilasData as UpazilaGeoItem[]).find(
          (u) => u.name.toLowerCase() === upazilaName.toLowerCase() || u.bn_name === upazilaName
        );
        if (upMatch) targetUpazilaId = upMatch.id;
      }

      let filtered = targetUpazilaId
        ? (unionsData as UnionGeoItem[]).filter((u) => u.upazila_id === targetUpazilaId)
        : (unionsData as UnionGeoItem[]).slice(0, 100);

      // If an urban upazila has no union rows, provide standard Sadar/Ward option
      if (targetUpazilaId && filtered.length === 0) {
        filtered = [
          {
            id: `${targetUpazilaId}-ward1`,
            upazila_id: targetUpazilaId,
            name: "Sadar / Ward 01",
            bn_name: "সদর / ওয়ার্ড ০১",
          },
          {
            id: `${targetUpazilaId}-ward2`,
            upazila_id: targetUpazilaId,
            name: "Central / Main Area",
            bn_name: "মূল শহর / এলাকা",
          },
        ];
      }

      return NextResponse.json({ success: true, count: filtered.length, data: filtered }, { headers });
    }

    // 5. Complete overview
    return NextResponse.json(
      {
        success: true,
        data: {
          divisions: divisionsData,
          districts: districtsData,
          upazilas: upazilasData,
        },
      },
      { headers }
    );
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || "Failed to load geo data" }, { status: 500 });
  }
}
