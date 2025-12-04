param dnsZoneName string
param txtRecord string
param txtRecordValue string
param ttl int = 60

resource zone 'Microsoft.Network/dnsZones@2018-05-01' existing = {
  name: dnsZoneName
}

resource dnsTXTRecord 'Microsoft.Network/dnsZones/TXT@2018-05-01' = {
  parent: zone
  name: txtRecord
  properties: {
    TTL: ttl
    TXTRecords: [{
        value: [txtRecordValue]
    }]
  }
}
