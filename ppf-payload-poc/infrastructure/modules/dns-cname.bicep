param dnsZoneName string
param cnameRecord string
param cnameRecordValue string
param ttl int = 600

resource zone 'Microsoft.Network/dnsZones@2018-05-01' existing = {
  name: dnsZoneName
}

resource dnsCNameRecord 'Microsoft.Network/dnsZones/CNAME@2018-05-01' = {
  parent: zone
  name: cnameRecord
  properties: {
    TTL: ttl
    CNAMERecord: {
        cname: cnameRecordValue
    }
  }
}

output fqdn string = dnsCNameRecord.properties.fqdn
