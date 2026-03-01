import json

def clean_and_merge_ngos():
    # Read the file and ignore any weird encoding errors
    with open('data/raw.json', 'r', encoding='utf-8', errors='ignore') as f:
        raw_content = f.read()

    # Clean up invisible non-breaking spaces that might crash the parser
    raw_content = raw_content.replace('\xa0', ' ')

    unique_ngos = {}
    total_scanned = 0

    # Set up the raw decoder
    decoder = json.JSONDecoder()
    idx = 0
    length = len(raw_content)

    print("Parsing stacked JSON blocks...")

    while idx < length:
        # Skip spaces, tabs, and newlines between the stacked {...} blocks
        while idx < length and raw_content[idx].isspace():
            idx += 1
        if idx >= length:
            break

        try:
            # raw_decode extracts one complete JSON object and returns the index where it stopped
            obj, idx = decoder.raw_decode(raw_content, idx)
            
            # If the block contains our target "ngos" array, process it
            if "ngos" in obj:
                for ngo in obj["ngos"]:
                    total_scanned += 1
                    ngo_id = ngo.get("ngoId")
                    
                    if ngo_id and ngo_id not in unique_ngos:
                        # Clean up formatting in names and addresses
                        name = str(ngo.get("ngoName", "")).strip().replace('\t', '')
                        address = str(ngo.get("address", "")).strip().replace('\n', ' ').replace('\t', '')
                        
                        clean_ngo = {
                            "ngoId": ngo_id,
                            "darpanId": ngo.get("darpanId"),
                            "ngoName": name,
                            "ngoType": ngo.get("ngoType"),
                            "registrationNo": ngo.get("registrationNo"),
                            "districtName": ngo.get("districtName"),
                            "stateName": ngo.get("stateName"),
                            "address": address,
                            "pinCode": ngo.get("pinCode"),
                            "subDstName": ngo.get("subDstName")
                        }
                        
                        if "lastUpdateOn" in ngo:
                            clean_ngo["lastUpdateOn"] = ngo["lastUpdateOn"]
                            
                        clean_ngo["sectors"] = "Disaster Management"
                        clean_ngo["migrated"] = ngo.get("migrated", False)
                        
                        if "latitude" in ngo:
                            clean_ngo["latitude"] = ngo["latitude"]
                        if "longitude" in ngo:
                            clean_ngo["longitude"] = ngo["longitude"]
                            
                        unique_ngos[ngo_id] = clean_ngo

        except json.JSONDecodeError:
            # If a block is completely corrupted, jump forward 1 character and keep hunting
            idx += 1

    # Build the final clean structure
    final_output = {
        "total_ngos": len(unique_ngos),
        "ngos": list(unique_ngos.values())
    }

    # Save to output file
    with open('clean_ngos.json', 'w', encoding='utf-8') as f:
        json.dump(final_output, f, indent=4, ensure_ascii=False)
        
    print(f"\nDone! Scanned {total_scanned} total entries from the raw text.")
    print(f"Successfully saved {len(unique_ngos)} UNIQUE NGOs into clean_ngos.json")

if __name__ == "__main__":
    clean_and_merge_ngos()