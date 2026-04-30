import pdfplumber

path = r'C:\Users\양동혁\Desktop\이지비스_LOCAL\경매사이트(우리로)\AI 부동산 경매 플랫폼 구축 기획서(초안).pdf'
with pdfplumber.open(path) as pdf:
    for i, page in enumerate(pdf.pages):
        txt = page.extract_text()
        if txt:
            print(f'=== PAGE {i+1} ===')
            print(txt)
            print()
