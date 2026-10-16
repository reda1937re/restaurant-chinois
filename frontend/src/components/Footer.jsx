export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <h3>Le Dragon d'Or</h3>
          <p>Cuisine chinoise traditionnelle, sur place ou en livraison.</p>
        </div>
        <div>
          <h4>Horaires</h4>
          <p>Tous les jours<br />11h30 – 23h00</p>
        </div>
        <div>
          <h4>Contact</h4>
          <p>8 rue de la Soie<br />01 23 45 67 89</p>
        </div>
      </div>
      <p className="copyright">© {new Date().getFullYear()} Le Dragon d'Or</p>
    </footer>
  )
}
