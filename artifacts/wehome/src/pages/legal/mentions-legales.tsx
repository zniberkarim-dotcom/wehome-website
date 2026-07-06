import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { LegalPage, P, UL, H3, Todo, type LegalSection } from "@/components/legal/LegalPage";

/** Section titles are translated; section bodies remain in French
 *  because the French version is legally authoritative (loi 53-05). */
function getSections(t: (key: string) => string): LegalSection[] {
  return [
    {
      id: "editeur",
      title: t("legal.mentions_s1_title"),
      content: (
        <>
          <P>
            Le site <strong>wehome.ma</strong> est édité par la société <strong>WeHome</strong>,
            dont les coordonnées sont&nbsp;:
          </P>
          <UL>
            <li>
              Raison sociale&nbsp;: <Todo>raison sociale exacte (ex. WeHome SARL)</Todo>
            </li>
            <li>
              Forme juridique&nbsp;: <Todo>SARL / SA / SAS</Todo>
            </li>
            <li>
              Capital social&nbsp;: <Todo>montant en MAD</Todo>
            </li>
            <li>
              Siège social&nbsp;: <Todo>adresse complète à Casablanca</Todo>
            </li>
            <li>
              Registre du Commerce (RC)&nbsp;: <Todo>numéro RC + ville</Todo>
            </li>
            <li>
              Identifiant Commun de l'Entreprise (ICE)&nbsp;: <Todo>15 chiffres</Todo>
            </li>
            <li>
              Identifiant Fiscal (IF)&nbsp;: <Todo>numéro IF</Todo>
            </li>
            <li>
              Taxe Professionnelle (Patente)&nbsp;: <Todo>numéro TP</Todo>
            </li>
            <li>Téléphone&nbsp;: +212 6 53 53 51 56</li>
            <li>Email&nbsp;: contact@wehome.ma</li>
          </UL>
        </>
      ),
    },
    {
      id: "publication",
      title: t("legal.mentions_s2_title"),
      content: (
        <>
          <P>
            Le directeur de la publication est <strong>Karim Zniber</strong>, en sa qualité de
            Directeur Général (CEO) de WeHome.
          </P>
          <P>
            Pour toute question relative au contenu publié sur le site, vous pouvez le joindre à
            l'adresse&nbsp;
            <a
              href="mailto:contact@wehome.ma"
              className="text-primary font-semibold hover:underline"
            >
              contact@wehome.ma
            </a>
            .
          </P>
        </>
      ),
    },
    {
      id: "hebergeur",
      title: t("legal.mentions_s3_title"),
      content: (
        <>
          <P>Le site est hébergé par&nbsp;:</P>
          <UL>
            <li>
              Société&nbsp;: <strong>Vercel Inc.</strong>
            </li>
            <li>Adresse&nbsp;: 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis</li>
            <li>
              Site web&nbsp;:{" "}
              <a
                href="https://vercel.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary font-semibold hover:underline"
              >
                vercel.com
              </a>
            </li>
          </UL>
          <P>
            Les bases de données et le stockage des fichiers sont opérés par{" "}
            <strong>Supabase Inc.</strong> (970 Toa Payoh North, #07-04, Singapore 318992) sur une
            infrastructure située dans l'Union européenne.
          </P>
        </>
      ),
    },
    {
      id: "propriete-intellectuelle",
      title: t("legal.mentions_s4_title"),
      content: (
        <>
          <P>
            L'ensemble du site wehome.ma — sa structure, ses textes, son design, son logo, ses
            photographies, ses bases de données et son code source — est protégé par la législation
            marocaine relative à la propriété intellectuelle, notamment la{" "}
            <strong>loi n° 2-00</strong> relative aux droits d'auteur et droits voisins.
          </P>
          <P>
            La marque <strong>WeHome</strong> et son logo sont la propriété exclusive de WeHome.
            Toute reproduction, représentation, modification, publication, transmission ou
            exploitation, totale ou partielle, par quelque procédé que ce soit, sans l'autorisation
            préalable et écrite de WeHome, est strictement interdite et constitue une contrefaçon
            sanctionnée par les articles 64 et suivants de la loi n° 2-00.
          </P>
          <P>
            Les annonces immobilières publiées sur le site (photos, descriptions, plans) restent la
            propriété de leurs auteurs respectifs (agents partenaires, vendeurs particuliers). Elles
            ne peuvent être réutilisées sans leur autorisation.
          </P>
        </>
      ),
    },
    {
      id: "liens-hypertextes",
      title: t("legal.mentions_s5_title"),
      content: (
        <>
          <P>
            Le site wehome.ma peut contenir des liens hypertextes vers d'autres sites internet.
            WeHome n'exerce aucun contrôle sur ces sites et décline toute responsabilité quant à
            leur contenu, leurs pratiques de confidentialité ou tout dommage résultant de leur
            consultation.
          </P>
          <P>
            La création d'un lien hypertexte pointant vers wehome.ma est soumise à l'accord
            préalable et écrit de l'éditeur. Toute insertion non autorisée peut faire l'objet d'une
            demande de retrait immédiat.
          </P>
        </>
      ),
    },
    {
      id: "donnees-personnelles",
      title: t("legal.mentions_s6_title"),
      content: (
        <>
          <P>
            Le traitement des données personnelles collectées sur wehome.ma est régi par la{" "}
            <strong>loi n° 09-08</strong> du 18 février 2009 relative à la protection des personnes
            physiques à l'égard des traitements de données à caractère personnel, et placé sous le
            contrôle de la <strong>CNDP</strong> (Commission Nationale de Contrôle de la Protection
            des Données à Caractère Personnel).
          </P>
          <P>
            Pour en savoir plus, consultez notre&nbsp;
            <a href="/confidentialite" className="text-primary font-semibold hover:underline">
              Politique de confidentialité
            </a>
            .
          </P>
          <H3>Déclaration CNDP</H3>
          <P>
            Les traitements de données mis en œuvre par WeHome ont fait l'objet d'une déclaration
            auprès de la CNDP sous le numéro&nbsp;<Todo>numéro de déclaration CNDP</Todo>.
          </P>
        </>
      ),
    },
    {
      id: "droit-applicable",
      title: t("legal.mentions_s7_title"),
      content: (
        <>
          <P>
            Les présentes mentions légales sont soumises au <strong>droit marocain</strong>. En cas
            de litige, et après échec de toute tentative de règlement amiable, les{" "}
            <strong>tribunaux de Casablanca</strong> seront seuls compétents.
          </P>
        </>
      ),
    },
  ];
}

export default function MentionsLegalesPage() {
  const { t, i18n } = useTranslation();
  const sections = useMemo(() => getSections(t), [i18n.language, t]);
  return (
    <LegalPage
      title={t("legal.mentions_title")}
      subtitle={t("legal.mentions_subtitle")}
      lastUpdated="13 mai 2026"
      sections={sections}
    />
  );
}
