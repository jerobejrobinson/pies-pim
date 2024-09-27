'use client'
import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

export default function Page() {
  const [inputXML, setInputXML] = useState('')
  const [outputXML, setOutputXML] = useState('')
  const { toast } = useToast()

  const fixXML = () => {
    try {
      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(inputXML, 'text/xml')

      // Fix PartInterchangeInfo structure
      const partInterchangeInfos = Array.from(xmlDoc.getElementsByTagName('PartInterchangeInfo'))
      partInterchangeInfos.forEach(info => {
        if (info.getElementsByTagName('PartInterchange').length === 0) {
          const partInterchange = xmlDoc.createElement('PartInterchange')
          while (info.firstChild) {
            partInterchange.appendChild(info.firstChild)
          }
          info.appendChild(partInterchange)
        }
      })

      // Fix Packages structure
      const items = Array.from(xmlDoc.getElementsByTagName('Item'))
      items.forEach(item => {
        const packages = item.getElementsByTagName('Packages')[0]
        if (packages) {
          const packageElement = packages.getElementsByTagName('Package')[0]
          if (!packageElement) {
            const newPackage = xmlDoc.createElement('Package')
            while (packages.firstChild) {
              newPackage.appendChild(packages.firstChild)
            }
            packages.appendChild(newPackage)
          }
        }
      })

      // Fix DigitalFileInformation structure
      const digitalFileInfos = Array.from(xmlDoc.getElementsByTagName('DigitalFileInformation'))
      digitalFileInfos.forEach(info => {
        const fileType = info.getElementsByTagName('FileType')[0]
        if (fileType) {
          const assetType = info.getElementsByTagName('AssetType')[0]
          if (assetType) {
            info.insertBefore(fileType, assetType)
          } else {
            info.appendChild(fileType)
          }
        }
      })

      // Remove empty PartTerminologyID and Description elements
      const emptyElements = xmlDoc.evaluate(
        "//*[not(node()) and (local-name()='PartTerminologyID' or local-name()='Description')]",
        xmlDoc,
        null,
        XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
        null
      )
      for (let i = emptyElements.snapshotLength - 1; i >= 0; i--) {
        const element = emptyElements.snapshotItem(i)
        if (element && element.parentNode) {
          element.parentNode.removeChild(element)
        }
      }

      // Serialize the fixed XML
      const serializer = new XMLSerializer()
      const fixedXML = serializer.serializeToString(xmlDoc)

      setOutputXML(fixedXML)
      toast({
        title: "XML Fixed",
        description: "The XML has been fixed. Please check the output.",
      })
    } catch (error) {
      console.error('Error fixing XML:', error)
      toast({
        title: "Error",
        description: "Failed to fix XML. Please check the console for details.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-4">
      <Textarea
        value={inputXML}
        onChange={(e) => setInputXML(e.target.value)}
        placeholder="Paste your XML here"
        rows={10}
      />
      <Button onClick={fixXML}>Fix XML</Button>
      <Textarea
        value={outputXML}
        readOnly
        placeholder="Fixed XML will appear here"
        rows={10}
      />
    </div>
  )
}