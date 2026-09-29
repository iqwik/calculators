export interface LicenseTemplate {
  id: string
  /** Full name — for SEO, docs, disclaimers */
  name: string
  /** Short name — for UI select trigger and options */
  shortName: string
  /** SPDX identifier — displayed as badge */
  spdx: string
  /** Short description shown under the select */
  hint: string
  usesYear: boolean
  usesName: boolean
  usesProject: boolean
  /** License body with placeholders {year}, {name}, {project} */
  body: string
}

export const LICENSE_TEMPLATES: LicenseTemplate[] = [
  {
    id: 'mit',
    name: 'MIT License',
    shortName: 'MIT',
    spdx: 'MIT',
    hint: 'Short, permissive. Most popular for open source.',
    usesYear: true,
    usesName: true,
    usesProject: true,
    body: `MIT License

Copyright (c) {year} {name}

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`,
  },
  {
    id: 'apache2',
    name: 'Apache License 2.0',
    shortName: 'Apache 2.0',
    spdx: 'Apache-2.0',
    hint: 'Permissive with explicit patent grant. Good for larger projects.',
    usesYear: true,
    usesName: true,
    usesProject: true,
    body: `                                 Apache License
                           Version 2.0, January 2004
                        http://www.apache.org/licenses/

   Copyright {year} {name}

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.

   ---

   Full text of the Apache License 2.0 is available at:
   https://www.apache.org/licenses/LICENSE-2.0.txt`,
  },
  {
    id: 'gpl3',
    name: 'GNU General Public License v3.0',
    shortName: 'GPL v3.0',
    spdx: 'GPL-3.0',
    hint: 'Copyleft. Derivative works must stay open source.',
    usesYear: true,
    usesName: true,
    usesProject: true,
    body: `{project}
Copyright (C) {year} {name}

                    GNU GENERAL PUBLIC LICENSE
                       Version 3, 29 June 2007

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with this program.  If not, see <https://www.gnu.org/licenses/>.

   ---

   Full text of the GNU GPL v3 is available at:
   https://www.gnu.org/licenses/gpl-3.0.txt`,
  },
  {
    id: 'agpl3',
    name: 'GNU Affero General Public License v3.0',
    shortName: 'AGPL v3.0',
    spdx: 'AGPL-3.0',
    hint: 'Copyleft, extends to network use. SaaS must share source.',
    usesYear: true,
    usesName: true,
    usesProject: true,
    body: `{project}
Copyright (C) {year} {name}

                    GNU AFFERO GENERAL PUBLIC LICENSE
                       Version 3, 19 November 2007

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU Affero General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this program.  If not, see <https://www.gnu.org/licenses/>.

   ---

   Full text of the GNU AGPL v3 is available at:
   https://www.gnu.org/licenses/agpl-3.0.txt`,
  },
  {
    id: 'lgpl3',
    name: 'GNU Lesser General Public License v3.0',
    shortName: 'LGPL v3.0',
    spdx: 'LGPL-3.0',
    hint: 'Weak copyleft. Linking allowed, modifications must stay open.',
    usesYear: true,
    usesName: true,
    usesProject: true,
    body: `{project}
Copyright (C) {year} {name}

                   GNU LESSER GENERAL PUBLIC LICENSE
                       Version 3, 29 June 2007

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU Lesser General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Lesser General Public License for more details.

 You should have received a copy of the GNU Lesser General Public License
 along with this program.  If not, see <https://www.gnu.org/licenses/>.

   ---

   Full text of the GNU LGPL v3 is available at:
   https://www.gnu.org/licenses/lgpl-3.0.txt`,
  },
  {
    id: 'bsd2',
    name: 'BSD 2-Clause "Simplified" License',
    shortName: 'BSD 2-Clause',
    spdx: 'BSD-2-Clause',
    hint: 'Permissive, similar to MIT but with different wording.',
    usesYear: true,
    usesName: true,
    usesProject: true,
    body: `BSD 2-Clause License

Copyright (c) {year}, {name}
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this
   list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.`,
  },
  {
    id: 'bsd3',
    name: 'BSD 3-Clause "New" or "Revised" License',
    shortName: 'BSD 3-Clause',
    spdx: 'BSD-3-Clause',
    hint: 'Permissive with no-endorsement clause. Common in academia.',
    usesYear: true,
    usesName: true,
    usesProject: true,
    body: `BSD 3-Clause License

Copyright (c) {year}, {name}
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this
   list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution.

3. Neither the name of the copyright holder nor the names of its contributors
   may be used to endorse or promote products derived from this software
   without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.`,
  },
  {
    id: 'isc',
    name: 'ISC License',
    shortName: 'ISC',
    spdx: 'ISC',
    hint: 'Permissive, simpler than MIT. Used by OpenBSD, npm.',
    usesYear: true,
    usesName: true,
    usesProject: true,
    body: `ISC License

Copyright (c) {year} {name}

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.`,
  },
  {
    id: 'mpl2',
    name: 'Mozilla Public License 2.0',
    shortName: 'MPL 2.0',
    spdx: 'MPL-2.0',
    hint: 'Weak copyleft at file level. Used by Firefox.',
    usesYear: false,
    usesName: false,
    usesProject: true,
    body: `Mozilla Public License Version 2.0
==================================

1. Definitions
--------------

1.1. "Contributor"
    means each individual or legal entity that creates, contributes to
    the creation of, or owns Covered Software.

1.2. "Contributor Version"
    means the combination of the Contributions of others (if any) used
    by a Contributor and that particular Contributor's Contribution.

   ...

   Full text of the Mozilla Public License 2.0 is available at:
   https://www.mozilla.org/en-US/MPL/2.0/`,
  },
  {
    id: 'unlicense',
    name: 'The Unlicense',
    shortName: 'Unlicense',
    spdx: 'Unlicense',
    hint: 'Public domain dedication. No restrictions.',
    usesYear: true,
    usesName: false,
    usesProject: true,
    body: `This is free and unencumbered software released into the public domain.

Anyone is free to copy, modify, publish, use, compile, sell, or distribute
this software, either in source code form or as a compiled binary, for any
purpose, commercial or non-commercial, and by any means.

In jurisdictions that recognize copyright laws, the author or authors of
this software dedicate any and all copyright interest in the software to
the public domain. We make this dedication for the benefit of the public at
large and to the detriment of our heirs and successors. We intend this
dedication to be an overt act of relinquishment in perpetuity of all present
and future rights to this software under copyright law.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

For more information, please refer to <https://unlicense.org>`,
  },
]
