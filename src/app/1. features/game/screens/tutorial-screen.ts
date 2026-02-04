import { Component, output } from '@angular/core';

@Component({
  selector: 'app-tutorial-screen',
  standalone: true,
  template: `
    <div class="tutorial-container">
      <h1 class="title">How to Play</h1>

      <!-- Section 1: Introduction to Traits -->
      <div class="section">
        <h2>What Are Traits?</h2>
        <p>
          Living things have <strong>traits</strong> — characteristics that make them look or act a
          certain way. In this game, our birds have traits like <strong>wing size</strong> and
          <strong>tail shape</strong>.
        </p>
        <p>
          Traits are passed down from parents to offspring through <strong>genes</strong>. Each gene
          comes in different versions called <strong>alleles</strong>.
        </p>
      </div>

      <!-- Section 2: Genotype vs Phenotype -->
      <div class="section">
        <h2>Genotype vs. Phenotype</h2>
        <div class="vocab-grid">
          <div class="vocab-card">
            <h3>Genotype</h3>
            <p>
              The <em>genetic code</em> — the combination of alleles an organism has. Written with
              letters like <span class="genotype">WW</span>, <span class="genotype">Ww</span>, or
              <span class="genotype">ww</span>.
            </p>
          </div>
          <div class="vocab-card">
            <h3>Phenotype</h3>
            <p>
              The <em>visible trait</em> — what the organism actually looks like. For example:
              "Large wings" or "Small wings."
            </p>
          </div>
        </div>

        <div class="key-concept">
          <strong>Key Concept:</strong> Capital letters (W) are <strong>dominant</strong> — they
          "show up" even when paired with a lowercase letter. Lowercase letters (w) are
          <strong>recessive</strong> — they only show when there's no dominant allele present.
        </div>
      </div>

      <!-- Section 3: Wing Size Examples -->
      <div class="section">
        <h2>Example: Wing Size</h2>
        <p>
          Let's look at the <strong>wing size</strong> trait. The dominant allele
          <span class="genotype">W</span> gives larger wings, while the recessive allele
          <span class="genotype">w</span> gives smaller wings.
        </p>

        <div class="bird-examples">
          <div class="bird-example">
            <img src="birds/lwst-WWTt.png" alt="Bird with large wings" class="bird-img" />
            <div class="bird-label">Large Wings</div>
            <div class="bird-genotype">WW</div>
            <div class="bird-desc">Two dominant alleles</div>
          </div>
          <div class="bird-example">
            <img src="birds/mwst-WwTt.png" alt="Bird with medium wings" class="bird-img" />
            <div class="bird-label">Medium Wings</div>
            <div class="bird-genotype">Ww</div>
            <div class="bird-desc">One of each allele</div>
          </div>
          <div class="bird-example">
            <img src="birds/swst-wwTt.png" alt="Bird with small wings" class="bird-img" />
            <div class="bird-label">Small Wings</div>
            <div class="bird-genotype">ww</div>
            <div class="bird-desc">Two recessive alleles</div>
          </div>
        </div>
      </div>

      <!-- Section 4: One-Trait Punnett Square -->
      <div class="section">
        <h2>Predicting Offspring: The Punnett Square</h2>
        <p>
          A <strong>Punnett square</strong> helps us predict what traits offspring might have. Each
          parent contributes one allele to their offspring.
        </p>

        <div class="punnett-example">
          <h3>Example: Crossing Two Medium-Wing Birds (Ww × Ww)</h3>
          <p class="punnett-setup">
            Parent 1 has genotype <span class="genotype">Ww</span> and Parent 2 has genotype
            <span class="genotype">Ww</span>. Let's see what offspring they might have:
          </p>

          <div class="punnett-demo">
            <table class="punnett-table" aria-label="Punnett Square for wing size cross Ww times Ww">
              <caption class="sr-only">
                Shows 4 possible offspring genotypes: WW, Ww, Ww, and ww
              </caption>
              <thead>
                <tr>
                  <th scope="col" class="corner"><span class="sr-only">Parent 1 / Parent 2</span></th>
                  <th scope="col" class="header">W</th>
                  <th scope="col" class="header">w</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row" class="header">W</th>
                  <td class="outcome">WW</td>
                  <td class="outcome">Ww</td>
                </tr>
                <tr>
                  <th scope="row" class="header">w</th>
                  <td class="outcome">Ww</td>
                  <td class="outcome">ww</td>
                </tr>
              </tbody>
            </table>

            <div class="punnett-results">
              <h4>Possible Outcomes:</h4>
              <ul>
                <li><span class="genotype">WW</span> = Large wings (25% chance)</li>
                <li><span class="genotype">Ww</span> = Medium wings (50% chance)</li>
                <li><span class="genotype">ww</span> = Small wings (25% chance)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Section 5: Two-Trait Punnett Square -->
      <div class="section">
        <h2>Two Traits at Once</h2>
        <p>
          In this game, birds have <strong>two traits</strong>: wing size (W/w) and tail shape
          (T/t). Each trait is inherited independently, so we use <strong>two Punnett squares</strong>
          — one for each trait.
        </p>

        <div class="two-trait-example">
          <h3>Example: Crossing Birds with Two Traits</h3>
          <p class="punnett-setup">
            Parent 1: <span class="genotype">Ww Tt</span> (Medium wings, Standard tail)<br />
            Parent 2: <span class="genotype">Ww Tt</span> (Medium wings, Standard tail)
          </p>

          <div class="dual-punnett">
            <figure class="punnett-box">
              <figcaption class="punnett-title">Wing Size</figcaption>
              <table class="punnett-table" aria-label="Wing Size Punnett Square">
                <thead>
                  <tr>
                    <th scope="col" class="corner"><span class="sr-only">Parent 1 / Parent 2</span></th>
                    <th scope="col" class="header">W</th>
                    <th scope="col" class="header">w</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row" class="header">W</th>
                    <td class="outcome">WW</td>
                    <td class="outcome">Ww</td>
                  </tr>
                  <tr>
                    <th scope="row" class="header">w</th>
                    <td class="outcome">Ww</td>
                    <td class="outcome">ww</td>
                  </tr>
                </tbody>
              </table>
            </figure>

            <figure class="punnett-box">
              <figcaption class="punnett-title">Tail Shape</figcaption>
              <table class="punnett-table" aria-label="Tail Shape Punnett Square">
                <thead>
                  <tr>
                    <th scope="col" class="corner"><span class="sr-only">Parent 1 / Parent 2</span></th>
                    <th scope="col" class="header">T</th>
                    <th scope="col" class="header">t</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row" class="header">T</th>
                    <td class="outcome">TT</td>
                    <td class="outcome">Tt</td>
                  </tr>
                  <tr>
                    <th scope="row" class="header">t</th>
                    <td class="outcome">Tt</td>
                    <td class="outcome">tt</td>
                  </tr>
                </tbody>
              </table>
            </figure>
          </div>

          <div class="key-concept">
            <strong>Remember:</strong> Each Punnett square gives you the odds for that one trait.
            The offspring gets one result from each square!
          </div>
        </div>
      </div>

      <!-- Section 6: Game Goal -->
      <div class="section goal-section">
        <h2>Your Goal</h2>
        <p>
          You'll be given a <strong>target bird</strong> with a specific genotype. Use what you've
          learned about Punnett squares to breed birds until you create one that matches the goal!
        </p>
        <div class="goal-info">
          <p>Select two parent birds → Predict the offspring → Breed → Repeat until you win!</p>
        </div>
      </div>

      <div class="button-group">
        <button class="back-button" (click)="backToIntro.emit()">Back</button>
        <button class="start-button" (click)="startGame.emit()">Start Game</button>
      </div>
    </div>
  `,
  styles: `
    .tutorial-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 32px;
      padding: 48px 24px;
      max-width: 700px;
      margin: 0 auto;
    }

    .title {
      font-size: 2.5rem;
      font-weight: 700;
      color: #1f2937;
      margin: 0;
      text-align: center;
    }

    /* Section styling */
    .section {
      background: #f9fafb;
      border-radius: 12px;
      padding: 24px;
      width: 100%;
      text-align: left;
    }

    .section h2 {
      font-size: 1.25rem;
      color: #1f2937;
      margin: 0 0 16px 0;
      font-weight: 600;
    }

    .section h3 {
      font-size: 1rem;
      color: #374151;
      margin: 0 0 12px 0;
      font-weight: 600;
    }

    .section p {
      color: #4b5563;
      margin: 0 0 12px 0;
      line-height: 1.6;
    }

    .section p:last-child {
      margin-bottom: 0;
    }

    /* Vocabulary cards */
    .vocab-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 16px;
    }

    .vocab-card {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 16px;
    }

    .vocab-card h3 {
      color: #1e40af;
      margin-bottom: 8px;
    }

    .vocab-card p {
      font-size: 0.875rem;
      margin: 0;
    }

    /* Key concept callout */
    .key-concept {
      background: #fef3c7;
      border: 1px solid #f59e0b;
      border-radius: 8px;
      padding: 12px 16px;
      color: #92400e;
      font-size: 0.875rem;
      line-height: 1.5;
    }

    /* Genotype styling */
    .genotype {
      font-family: monospace;
      font-weight: 600;
      background: #e5e7eb;
      padding: 2px 6px;
      border-radius: 4px;
      color: #1f2937;
    }

    /* Bird examples grid */
    .bird-examples {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-top: 16px;
    }

    .bird-example {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 16px;
      text-align: center;
    }

    .bird-img {
      width: 100px;
      height: 100px;
      object-fit: contain;
      margin-bottom: 8px;
    }

    .bird-label {
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 4px;
    }

    .bird-genotype {
      font-family: monospace;
      font-size: 1.25rem;
      font-weight: 700;
      color: #1e40af;
      background: #dbeafe;
      padding: 4px 12px;
      border-radius: 4px;
      display: inline-block;
      margin-bottom: 4px;
    }

    .bird-desc {
      font-size: 0.75rem;
      color: #6b7280;
    }

    /* Punnett square examples */
    .punnett-example,
    .two-trait-example {
      margin-top: 16px;
    }

    .punnett-setup {
      margin-bottom: 16px;
    }

    .punnett-demo {
      display: flex;
      align-items: flex-start;
      gap: 32px;
      flex-wrap: wrap;
      justify-content: center;
    }

    .dual-punnett {
      display: flex;
      gap: 32px;
      justify-content: center;
      flex-wrap: wrap;
      margin-bottom: 16px;
    }

    .punnett-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      margin: 0;
    }

    .punnett-title {
      font-weight: 600;
      color: #374151;
      font-size: 0.875rem;
    }

    .punnett-table {
      border-collapse: separate;
      border-spacing: 2px;
    }

    .punnett-table th,
    .punnett-table td {
      width: 48px;
      height: 48px;
      text-align: center;
      vertical-align: middle;
      font-family: monospace;
      font-size: 1rem;
    }

    .corner {
      background: transparent;
    }

    .header {
      background: #e5e7eb;
      font-weight: 700;
      color: #374151;
      border-radius: 4px;
    }

    .outcome {
      background: #dbeafe;
      color: #1e40af;
      border-radius: 4px;
      font-weight: 500;
    }

    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }

    .punnett-results {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 16px;
    }

    .punnett-results h4 {
      margin: 0 0 8px 0;
      font-size: 0.875rem;
      color: #374151;
    }

    .punnett-results ul {
      margin: 0;
      padding-left: 20px;
      font-size: 0.875rem;
      color: #4b5563;
    }

    .punnett-results li {
      margin-bottom: 4px;
    }

    /* Goal section */
    .goal-section {
      background: #dbeafe;
      border: 2px solid #3b82f6;
    }

    .goal-section h2 {
      color: #1e40af;
    }

    .goal-section p {
      color: #1e40af;
    }

    .goal-section .goal-info {
      background: white;
      border-radius: 8px;
      padding: 16px;
      text-align: center;
    }

    .goal-section .goal-info p {
      color: #374151;
      font-weight: 500;
      margin: 0;
    }

    /* Buttons */
    .button-group {
      display: flex;
      gap: 12px;
      margin-top: 12px;
    }

    .back-button {
      background: #f3f4f6;
      color: #374151;
      border: 2px solid #d1d5db;
      border-radius: 8px;
      padding: 16px 32px;
      font-size: 1.125rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .back-button:hover {
      background: #e5e7eb;
      border-color: #9ca3af;
    }

    .start-button {
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 8px;
      padding: 16px 32px;
      font-size: 1.125rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s ease;
    }

    .start-button:hover {
      background: #2563eb;
    }

    /* Responsive adjustments */
    @media (max-width: 600px) {
      .vocab-grid {
        grid-template-columns: 1fr;
      }

      .bird-examples {
        grid-template-columns: 1fr;
      }

      .punnett-demo {
        flex-direction: column;
        align-items: center;
      }

      .dual-punnett {
        flex-direction: column;
        align-items: center;
      }
    }
  `,
})
export class TutorialScreenComponent {
  startGame = output();
  backToIntro = output();
}
